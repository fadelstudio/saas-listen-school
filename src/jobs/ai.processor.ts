import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES } from '../core/config/queue';
import { redisConnection } from '../core/config/redis';
import { prisma } from '../core/database/prisma';
import { AiJobStatus, Prisma } from '@prisma/client';

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
  processedAt:     string;
  [key: string]:   unknown;
}

import { aiBalancer } from '../core/ai/AiBalancer';

// ─── AI Call Helper ───────────────────────────────────────────────────────────

async function callAI(prompt: string): Promise<string> {
  const response = await aiBalancer.callAI(prompt);
  return response.content;
}

function analysisPrompt(content: string): string {
  return `Donne une réponse UNIQUEMENT au format JSON strict. Ne rajoute aucun texte avant ou après.
Format attendu: {"sentiment":"negative","category":"pédagogie","priority":"HIGH","summary":"...","recommendation":"...","confidence":0.85}

Contenu à analyser: ${content}`;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleReportAnalysis(payload: AiAnalysisPayload): Promise<AiAnalysisResult> {
  const report = await prisma.report.findUnique({ where: { id: payload.reportId! } });
  if (!report) throw new Error(`Report not found: ${payload.reportId}`);

  const raw    = await callAI(analysisPrompt(`${report.title}\n${report.content}`));
  const result = { ...JSON.parse(raw) as AiAnalysisResult, processedAt: new Date().toISOString() };

  await prisma.report.update({ where: { id: report.id }, data: { aiAnalysis: JSON.stringify(result) } });
  return result;
}

async function handleEvaluationScoring(payload: AiAnalysisPayload): Promise<AiAnalysisResult> {
  const evaluation = await prisma.evaluation.findUnique({ where: { id: payload.evaluationId! } });
  if (!evaluation) throw new Error(`Evaluation not found: ${payload.evaluationId}`);

  const raw    = await callAI(analysisPrompt(`Score: ${evaluation.score ?? 'N/A'} | ${evaluation.comment ?? ''}`));
  const result = { ...JSON.parse(raw) as AiAnalysisResult, processedAt: new Date().toISOString() };

  await prisma.evaluation.update({
    where: { id: evaluation.id },
    data:  { aiScore: (result.confidence ?? 0.5) * 20 },
  });
  return result;
}

async function handleDecisionSuggestion(payload: AiAnalysisPayload): Promise<AiAnalysisResult> {
  const decision = await prisma.decision.findUnique({
    where: { id: payload.decisionId! }, include: { evaluation: true }
  });
  if (!decision) throw new Error(`Decision not found: ${payload.decisionId}`);

  const raw    = await callAI(analysisPrompt(decision.evaluation.comment ?? 'No comment'));
  const result = { ...JSON.parse(raw) as AiAnalysisResult, processedAt: new Date().toISOString() };

  await prisma.decision.update({
    where: { id: decision.id }, data: { aiSuggestion: result.recommendation ?? '' }
  });
  return result;
}

async function handleGlobalSynthesis(): Promise<AiAnalysisResult> {
  const [reports, evals] = await Promise.all([
    prisma.report.findMany({ take: 50, select: { title: true, content: true, type: true } }),
    prisma.evaluation.findMany({ take: 50, select: { score: true, comment: true } }),
  ]);
  
  const context = `Signalements: ${JSON.stringify(reports)}\nEvaluations: ${JSON.stringify(evals)}`;
  const prompt = `En tant qu'assistant de pilotage académique, analyse les données suivantes et fais une synthèse stratégique.
Donne une réponse UNIQUEMENT en JSON strict.
Format: {"summary":"Synthèse des points clés","recommendation":"Actions suggérées","confidence":0.9}

Données: ${context}`;

  const raw = await callAI(prompt);
  try {
    return { ...JSON.parse(raw) as AiAnalysisResult, processedAt: new Date().toISOString() };
  } catch (e) {
    return { summary: raw, processedAt: new Date().toISOString(), confidence: 0.5 };
  }
}

async function handleChatQuery(payload: AiAnalysisPayload): Promise<AiAnalysisResult> {
  const [recentReports, recentEvals] = await Promise.all([
    prisma.report.findMany({ take: 10, select: { title: true, content: true } }),
    prisma.evaluation.findMany({ take: 10, select: { comment: true } }),
  ]);

  const prompt = `Contexte récent de l'école:
Signalements: ${JSON.stringify(recentReports)}
Evaluations: ${JSON.stringify(recentEvals)}

Question de l'utilisateur: ${payload.question}

Réponds de manière concise et utile en JSON strict.
Format: {"summary":"Ta réponse ici","recommendation":"","confidence":0.95}`;

  const raw = await callAI(prompt);
  try {
    return { ...JSON.parse(raw) as AiAnalysisResult, processedAt: new Date().toISOString() };
  } catch (e) {
    return { summary: raw, processedAt: new Date().toISOString(), confidence: 0.5 };
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
        case 'global-synthesis':    result = await handleGlobalSynthesis();   break;
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

aiWorker.on('completed', (job) => console.log(`✅ AI job completed: ${job.id} [${job.data.type}]`));
aiWorker.on('failed', (job, err) => console.error(`❌ AI job failed: ${job?.id}`, err.message));
aiWorker.on('error', (_err) => { /* Silence Redis errors */ });

export default aiWorker;
