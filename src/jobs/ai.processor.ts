import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES } from '../core/config/queue';
import { redisConnection } from '../core/config/redis';
import { prisma } from '../core/database/prisma';
import { AiJobStatus, Prisma, Priority } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger';

// ─── Job Payload Types ────────────────────────────────────────────────────────

export interface AiAnalysisPayload {
  type: 'report-analysis' | 'evaluation-scoring' | 'decision-suggestion' | 'global-synthesis' | 'chat-query';
  reportId?:     string;
  evaluationId?: string;
  decisionId?:   string;
  question?:     string;
  userId?:       string;
  startDate?:    string;
  endDate?:      string;
}

interface AiAnalysisResult {
  sentiment?:      string;
  category?:       string;
  priority?:       string;
  summary?:        string;
  recommendation?: string;
  confidence?:     number;
  score?:          number;
  processedAt:     string;
  [key: string]:   unknown;
}

import { aiBalancer } from '../core/ai/AiBalancer';

// ─── AI Call Helper ───────────────────────────────────────────────────────────

async function callAI(prompt: string, schoolId: string): Promise<string> {
  const response = await aiBalancer.callAI(prompt, schoolId);
  return response.content;
}

const aiResultSchema = z.object({
  sentiment: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  summary: z.string().optional(),
  recommendation: z.string().optional(),
  confidence: z.coerce.number().min(0).max(1).optional(),
  score: z.coerce.number().min(0).max(20).optional(),
});

function parseAiJsonStrict(raw: string): Omit<AiAnalysisResult, 'processedAt'> {
  // 1. Try to extract the JSON block using regex (most robust method)
  const match = raw.match(/\{[\s\S]*\}/);
  const cleanRaw = match ? match[0] : raw.trim();

  try {
    const parsed = JSON.parse(cleanRaw) as unknown;
    const validated = aiResultSchema.safeParse(parsed);
    if (!validated.success) {
      const issues = validated.error.issues.map((i) => `${i.path.join('.') || 'root'}: ${i.message}`).join('; ');
      throw new Error(`AI JSON validation failed: ${issues}`);
    }
    return validated.data;
  } catch (e) {
    throw new Error(`Invalid JSON response from AI: ${e instanceof Error ? e.message : String(e)} (Raw: ${raw.slice(0, 100)}...)`);
  }
}

function analysisPrompt(content: string): string {
  return `Donne une réponse UNIQUEMENT au format JSON strict. Ne rajoute aucun texte avant ou après.
Format attendu: {"sentiment":"negative","category":"pédagogie","priority":"HIGH","summary":"...","recommendation":"...","confidence":0.85,"score":15}

Contenu à analyser: ${content}`;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleReportAnalysis(payload: AiAnalysisPayload): Promise<AiAnalysisResult> {
  const report = await prisma.report.findUnique({ where: { id: payload.reportId! } });
  if (!report) throw new Error(`Report not found: ${payload.reportId}`);

  const raw    = await callAI(analysisPrompt(`${report.title}\n${report.content}`), report.schoolId as string);
  const validated = parseAiJsonStrict(raw);
  const result: AiAnalysisResult = { ...validated, processedAt: new Date().toISOString() };

  await prisma.report.update({
    where: { id: report.id },
    data: { aiAnalysis: result as unknown as Prisma.InputJsonObject },
  });

  // 4. Proactive Decision: Create a PROPOSED decision ONLY if priority is HIGH/CRITICAL
  if (result.priority === 'HIGH' || result.priority === 'CRITICAL') {
    const systemUser = await prisma.user.findFirst({ where: { role: 'ADMIN', schoolId: report.schoolId as string } });
    if (systemUser) {
      await prisma.decision.create({
        data: {
          reportId:     report.id,
          schoolId:     report.schoolId,
          deciderId:    systemUser.id,
          title:        `Action requise : ${report.title}`,
          rationale:    result.summary,
          aiSuggestion: result.recommendation,
          priority:     result.priority as Priority,
          status:       'PROPOSED',
        } as any,
      });
    }
  }

  return result;
}

async function handleEvaluationScoring(payload: AiAnalysisPayload): Promise<AiAnalysisResult> {
  const evaluation = await prisma.evaluation.findUnique({ where: { id: payload.evaluationId! } });
  if (!evaluation) throw new Error(`Evaluation not found: ${payload.evaluationId}`);

  const rubric = [
    evaluation.comprehensionRating,
    evaluation.explanationRating,
    evaluation.pedagogyRating,
    evaluation.availabilityRating,
    evaluation.rhythmRating,
  ].join(', ');
  const raw = await callAI(
    analysisPrompt(
      `Score: ${evaluation.score ?? 'N/A'} | Rubric: ${rubric} | ${evaluation.comment ?? ''}`
    ),
    evaluation.schoolId as string
  );
  const validated = parseAiJsonStrict(raw);
  const result: AiAnalysisResult = { ...validated, processedAt: new Date().toISOString() };

  const computedScore = typeof result.score === 'number'
    ? result.score
    : Math.round(((result.confidence ?? 0.5) * 20) * 10) / 10;

  await prisma.evaluation.update({
    where: { id: evaluation.id },
    data:  { aiScore: computedScore },
  });
  return result;
}

async function handleDecisionSuggestion(payload: AiAnalysisPayload): Promise<AiAnalysisResult> {
  const decision = await prisma.decision.findUnique({
    where: { id: payload.decisionId! }, include: { evaluation: true }
  });
  if (!decision) throw new Error(`Decision not found: ${payload.decisionId}`);

  const promptContent = decision.evaluation?.comment || 'No comment';
  const schoolId = decision.evaluation?.schoolId || (await prisma.report.findUnique({ where: { id: decision.reportId || '' } }))?.schoolId;
  
  if (!schoolId) throw new Error('Could not determine school context for AI analysis');

  const raw    = await callAI(analysisPrompt(promptContent), schoolId);
  const validated = parseAiJsonStrict(raw);
  const result: AiAnalysisResult = { ...validated, processedAt: new Date().toISOString() };

  await prisma.decision.update({
    where: { id: decision.id }, data: { aiSuggestion: result.recommendation ?? '' }
  });
  return result;
}

async function handleGlobalSynthesis(payload: AiAnalysisPayload): Promise<AiAnalysisResult> {
  const schoolId = payload.userId ? (await prisma.user.findUnique({ where: { id: payload.userId }, select: { schoolId: true } }))?.schoolId : null;
  if (!schoolId) throw new Error('Global synthesis context missing');

  const [reports, evals] = await Promise.all([
    prisma.report.findMany({ where: { schoolId }, take: 50, select: { title: true, content: true, type: true } }),
    prisma.evaluation.findMany({ where: { schoolId }, take: 50, select: { score: true, comment: true } }),
  ]);
  
  const context = `Signalements: ${JSON.stringify(reports)}\nEvaluations: ${JSON.stringify(evals)}`;
  const prompt = `En tant qu'assistant de pilotage académique, analyse les données suivantes et fais une synthèse stratégique.
  Donne une réponse UNIQUEMENT en JSON strict.
  Format: {"summary":"Synthèse des points clés","recommendation":"Actions suggérées","confidence":0.9}
  
  Données: ${context}`;

  const raw = await callAI(prompt, schoolId);
  const processedAt = new Date().toISOString();

  try {
    const validated = parseAiJsonStrict(raw);
    return { ...validated, processedAt };
  } catch (e) {
    // For synthesis/chat, we keep a fallback summary to not lose the response content.
    return {
      summary: raw,
      recommendation: '',
      confidence: 0.5,
      processedAt,
    };
  }
}

async function handleChatQuery(payload: AiAnalysisPayload): Promise<AiAnalysisResult> {
  const user = await prisma.user.findUnique({ where: { id: payload.userId! }, select: { schoolId: true } });
  if (!user?.schoolId) throw new Error('Chat context missing schoolId');
  const schoolId = user.schoolId;

  const [recentReports, recentEvals] = await Promise.all([
    prisma.report.findMany({ where: { schoolId }, take: 10, select: { title: true, content: true } }),
    prisma.evaluation.findMany({ where: { schoolId }, take: 10, select: { comment: true } }),
  ]);

  const prompt = `Contexte récent de l'école:
  Signalements: ${JSON.stringify(recentReports)}
  Evaluations: ${JSON.stringify(recentEvals)}
  
  Question de l'utilisateur: ${payload.question}
  
  Réponds de manière concise et utile en JSON strict.
  Format: {"summary":"Ta réponse ici","recommendation":"","confidence":0.95}`;

  const raw = await callAI(prompt, schoolId);
  const processedAt = new Date().toISOString();

  try {
    const validated = parseAiJsonStrict(raw);
    return { ...validated, processedAt };
  } catch (e) {
    return {
      summary: raw,
      recommendation: '',
      confidence: 0.5,
      processedAt,
    };
  }
}

// ─── BullMQ Worker ────────────────────────────────────────────────────────────

const aiWorker = new Worker<AiAnalysisPayload>(
  QUEUE_NAMES.AI_ANALYSIS,
  async (job: Job<AiAnalysisPayload>) => {
    const aiJob = await prisma.aiJob.create({
      data: {
        jobType:     job.data.type,
        status:      AiJobStatus.PROCESSING,
        payload:     job.data as unknown as Prisma.InputJsonObject,
        reportId:    job.data.reportId    ?? null,
        evaluationId: job.data.evaluationId ?? null,
        decisionId:  job.data.decisionId  ?? null,
      },
    });

    try {
      let result: AiAnalysisResult;

      switch (job.data.type) {
        case 'report-analysis':     result = await handleReportAnalysis(job.data);    break;
        case 'evaluation-scoring':  result = await handleEvaluationScoring(job.data); break;
        case 'decision-suggestion': result = await handleDecisionSuggestion(job.data); break;
        case 'global-synthesis':    result = await handleGlobalSynthesis(job.data);   break;
        case 'chat-query':          result = await handleChatQuery(job.data);         break;
        default: throw new Error(`Unknown job type: ${job.data.type}`);
      }

      await prisma.aiJob.update({
        where: { id: aiJob.id },
        data:  { status: AiJobStatus.DONE, result: result as unknown as Prisma.InputJsonObject },
      });

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await prisma.aiJob.update({
        where: { id: aiJob.id },
        data:  { status: AiJobStatus.FAILED, errorMessage: message },
      });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

aiWorker.on('completed', (job) => logger.info(`✅ AI job completed: ${job.id} [${job.data.type}]`));

aiWorker.on('failed', async (job, err) => {
  logger.error(`❌ AI job failed: ${job?.id} ${job?.data.type}`, { message: err.message.slice(0, 200) });
  // NOTE: School-scoped admin notifications are handled directly by AiBalancer
  // (quota-switch + total-failure events, throttled per 5 min).
  // We do NOT duplicate them here to avoid notification spam.
});

aiWorker.on('error', (_err) => { /* Silence Redis errors */ });

export default aiWorker;
