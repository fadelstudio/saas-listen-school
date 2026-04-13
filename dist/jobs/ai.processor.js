"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const queue_1 = require("../core/config/queue");
const redis_1 = require("../core/config/redis");
const prisma_1 = require("../core/database/prisma");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const AiBalancer_1 = require("../core/ai/AiBalancer");
// ─── AI Call Helper ───────────────────────────────────────────────────────────
async function callAI(prompt) {
    const response = await AiBalancer_1.aiBalancer.callAI(prompt);
    return response.content;
}
const aiResultSchema = zod_1.z.object({
    sentiment: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    priority: zod_1.z.string().optional(),
    summary: zod_1.z.string().optional(),
    recommendation: zod_1.z.string().optional(),
    confidence: zod_1.z.coerce.number().min(0).max(1).optional(),
    score: zod_1.z.coerce.number().min(0).max(20).optional(),
});
function parseAiJsonStrict(raw) {
    // We accept ONLY a JSON object. If model returns extra text, parsing fails.
    const parsed = JSON.parse(raw);
    const validated = aiResultSchema.safeParse(parsed);
    if (!validated.success) {
        const issues = validated.error.issues.map((i) => `${i.path.join('.') || 'root'}: ${i.message}`).join('; ');
        throw new Error(`AI JSON validation failed: ${issues}`);
    }
    return validated.data;
}
function analysisPrompt(content) {
    return `Donne une réponse UNIQUEMENT au format JSON strict. Ne rajoute aucun texte avant ou après.
Format attendu: {"sentiment":"negative","category":"pédagogie","priority":"HIGH","summary":"...","recommendation":"...","confidence":0.85,"score":15}

Contenu à analyser: ${content}`;
}
// ─── Handlers ─────────────────────────────────────────────────────────────────
async function handleReportAnalysis(payload) {
    const report = await prisma_1.prisma.report.findUnique({ where: { id: payload.reportId } });
    if (!report)
        throw new Error(`Report not found: ${payload.reportId}`);
    const raw = await callAI(analysisPrompt(`${report.title}\n${report.content}`));
    const validated = parseAiJsonStrict(raw);
    const result = { ...validated, processedAt: new Date().toISOString() };
    await prisma_1.prisma.report.update({
        where: { id: report.id },
        data: { aiAnalysis: result },
    });
    return result;
}
async function handleEvaluationScoring(payload) {
    const evaluation = await prisma_1.prisma.evaluation.findUnique({ where: { id: payload.evaluationId } });
    if (!evaluation)
        throw new Error(`Evaluation not found: ${payload.evaluationId}`);
    const raw = await callAI(analysisPrompt(`Score: ${evaluation.score ?? 'N/A'} | ${evaluation.comment ?? ''}`));
    const validated = parseAiJsonStrict(raw);
    const result = { ...validated, processedAt: new Date().toISOString() };
    const computedScore = typeof result.score === 'number'
        ? result.score
        : Math.round(((result.confidence ?? 0.5) * 20) * 10) / 10;
    await prisma_1.prisma.evaluation.update({
        where: { id: evaluation.id },
        data: { aiScore: computedScore },
    });
    return result;
}
async function handleDecisionSuggestion(payload) {
    const decision = await prisma_1.prisma.decision.findUnique({
        where: { id: payload.decisionId }, include: { evaluation: true }
    });
    if (!decision)
        throw new Error(`Decision not found: ${payload.decisionId}`);
    const raw = await callAI(analysisPrompt(decision.evaluation.comment ?? 'No comment'));
    const validated = parseAiJsonStrict(raw);
    const result = { ...validated, processedAt: new Date().toISOString() };
    await prisma_1.prisma.decision.update({
        where: { id: decision.id }, data: { aiSuggestion: result.recommendation ?? '' }
    });
    return result;
}
async function handleGlobalSynthesis() {
    const [reports, evals] = await Promise.all([
        prisma_1.prisma.report.findMany({ take: 50, select: { title: true, content: true, type: true } }),
        prisma_1.prisma.evaluation.findMany({ take: 50, select: { score: true, comment: true } }),
    ]);
    const context = `Signalements: ${JSON.stringify(reports)}\nEvaluations: ${JSON.stringify(evals)}`;
    const prompt = `En tant qu'assistant de pilotage académique, analyse les données suivantes et fais une synthèse stratégique.
Donne une réponse UNIQUEMENT en JSON strict.
Format: {"summary":"Synthèse des points clés","recommendation":"Actions suggérées","confidence":0.9}

Données: ${context}`;
    const raw = await callAI(prompt);
    const processedAt = new Date().toISOString();
    try {
        const validated = parseAiJsonStrict(raw);
        return { ...validated, processedAt };
    }
    catch (e) {
        // For synthesis/chat, we keep a fallback summary to not lose the response content.
        return {
            summary: raw,
            recommendation: '',
            confidence: 0.5,
            processedAt,
        };
    }
}
async function handleChatQuery(payload) {
    const [recentReports, recentEvals] = await Promise.all([
        prisma_1.prisma.report.findMany({ take: 10, select: { title: true, content: true } }),
        prisma_1.prisma.evaluation.findMany({ take: 10, select: { comment: true } }),
    ]);
    const prompt = `Contexte récent de l'école:
Signalements: ${JSON.stringify(recentReports)}
Evaluations: ${JSON.stringify(recentEvals)}

Question de l'utilisateur: ${payload.question}

Réponds de manière concise et utile en JSON strict.
Format: {"summary":"Ta réponse ici","recommendation":"","confidence":0.95}`;
    const raw = await callAI(prompt);
    const processedAt = new Date().toISOString();
    try {
        const validated = parseAiJsonStrict(raw);
        return { ...validated, processedAt };
    }
    catch (e) {
        return {
            summary: raw,
            recommendation: '',
            confidence: 0.5,
            processedAt,
        };
    }
}
// ─── BullMQ Worker ────────────────────────────────────────────────────────────
const aiWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.AI_ANALYSIS, async (job) => {
    const aiJob = await prisma_1.prisma.aiJob.create({
        data: {
            jobType: job.data.type,
            status: client_1.AiJobStatus.PROCESSING,
            payload: job.data,
            reportId: job.data.reportId ?? null,
            evaluationId: job.data.evaluationId ?? null,
            decisionId: job.data.decisionId ?? null,
        },
    });
    try {
        let result;
        switch (job.data.type) {
            case 'report-analysis':
                result = await handleReportAnalysis(job.data);
                break;
            case 'evaluation-scoring':
                result = await handleEvaluationScoring(job.data);
                break;
            case 'decision-suggestion':
                result = await handleDecisionSuggestion(job.data);
                break;
            case 'global-synthesis':
                result = await handleGlobalSynthesis();
                break;
            case 'chat-query':
                result = await handleChatQuery(job.data);
                break;
            default: throw new Error(`Unknown job type: ${job.data.type}`);
        }
        await prisma_1.prisma.aiJob.update({
            where: { id: aiJob.id },
            data: { status: client_1.AiJobStatus.DONE, result: result },
        });
        return result;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await prisma_1.prisma.aiJob.update({
            where: { id: aiJob.id },
            data: { status: client_1.AiJobStatus.FAILED, errorMessage: message },
        });
        throw error;
    }
}, {
    connection: redis_1.redisConnection,
    concurrency: 3,
});
const notifications_service_1 = require("../modules/notifications/notifications.service");
aiWorker.on('completed', (job) => console.log(`✅ AI job completed: ${job.id} [${job.data.type}]`));
aiWorker.on('failed', async (job, err) => {
    console.error(`❌ AI job failed: ${job?.id}`, err.message);
    // Notify internal profiles about AI failure
    await notifications_service_1.notificationService.create({
        title: `Échec du traitement IA [${job?.data.type}]`,
        message: `Le traitement automatique a échoué: ${err.message}. ID Job: ${job?.id}`,
        type: 'AI_FAILURE',
    }).catch(e => console.error('Failed to create failure notification:', e));
});
aiWorker.on('error', (_err) => { });
exports.default = aiWorker;
//# sourceMappingURL=ai.processor.js.map