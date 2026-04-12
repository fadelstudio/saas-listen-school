"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const queue_1 = require("../core/config/queue");
const redis_1 = require("../core/config/redis");
const prisma_1 = require("../core/database/prisma");
const env_1 = require("../core/config/env");
const client_1 = require("@prisma/client");
// ─── AI Call Helpers ──────────────────────────────────────────────────────────
async function callGemini(prompt) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${env_1.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (!res.ok)
        throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    return data.candidates[0]?.content.parts[0]?.text ?? '';
}
async function callGroq(prompt) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env_1.env.GROQ_API_KEY}` },
        body: JSON.stringify({ model: 'llama3-8b-8192', messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok)
        throw new Error(`Groq error: ${res.status}`);
    const data = await res.json();
    return data.choices[0]?.message.content ?? '';
}
async function callAI(prompt) {
    try {
        return await callGemini(prompt);
    }
    catch {
        return await callGroq(prompt);
    } // fallback
}
function analysisPrompt(content) {
    return `Analyse et retourne UNIQUEMENT un JSON :
{"sentiment":"negative","category":"pédagogie","priority":"HIGH","summary":"...","recommendation":"...","confidence":0.85}

Contenu: ${content}`;
}
// ─── Handlers ─────────────────────────────────────────────────────────────────
async function handleReportAnalysis(payload) {
    const report = await prisma_1.prisma.report.findUnique({ where: { id: payload.reportId } });
    if (!report)
        throw new Error(`Report not found: ${payload.reportId}`);
    const raw = await callAI(analysisPrompt(`${report.title}\n${report.content}`));
    const result = { ...JSON.parse(raw), processedAt: new Date().toISOString() };
    await prisma_1.prisma.report.update({ where: { id: report.id }, data: { aiAnalysis: JSON.stringify(result) } });
    return result;
}
async function handleEvaluationScoring(payload) {
    const evaluation = await prisma_1.prisma.evaluation.findUnique({ where: { id: payload.evaluationId } });
    if (!evaluation)
        throw new Error(`Evaluation not found: ${payload.evaluationId}`);
    const raw = await callAI(analysisPrompt(`Score: ${evaluation.score ?? 'N/A'} | ${evaluation.comments ?? ''}`));
    const result = { ...JSON.parse(raw), processedAt: new Date().toISOString() };
    await prisma_1.prisma.evaluation.update({
        where: { id: evaluation.id },
        data: { aiScore: (result.confidence ?? 0.5) * 20 },
    });
    return result;
}
async function handleDecisionSuggestion(payload) {
    const decision = await prisma_1.prisma.decision.findUnique({
        where: { id: payload.decisionId }, include: { evaluation: true }
    });
    if (!decision)
        throw new Error(`Decision not found: ${payload.decisionId}`);
    const raw = await callAI(analysisPrompt(decision.evaluation.comments ?? 'No comments'));
    const result = { ...JSON.parse(raw), processedAt: new Date().toISOString() };
    await prisma_1.prisma.decision.update({
        where: { id: decision.id }, data: { aiSuggestion: result.recommendation ?? '' }
    });
    return result;
}
async function handleGlobalSynthesis() {
    const [reports, evals] = await Promise.all([
        prisma_1.prisma.report.findMany({ take: 50, select: { title: true, content: true } }),
        prisma_1.prisma.evaluation.findMany({ take: 50, select: { score: true, comments: true } }),
    ]);
    const prompt = `Synthèse globale de ${reports.length} signalements et ${evals.length} évaluations. Retourne JSON: {"summary":"...","recommendation":"...","confidence":0.9}`;
    const raw = await callAI(prompt);
    return { ...JSON.parse(raw), processedAt: new Date().toISOString() };
}
async function handleChatQuery(payload) {
    const context = await prisma_1.prisma.report.findMany({ take: 10, select: { title: true } });
    const prompt = `Contexte: ${JSON.stringify(context)}\n\nQuestion: ${payload.question}\n\nRéponds en JSON: {"summary":"réponse","recommendation":"","confidence":0.9}`;
    const raw = await callAI(prompt);
    return { ...JSON.parse(raw), processedAt: new Date().toISOString() };
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
aiWorker.on('completed', (job) => console.log(`✅ AI job completed: ${job.id} [${job.data.type}]`));
aiWorker.on('failed', (job, err) => console.error(`❌ AI job failed: ${job?.id}`, err.message));
exports.default = aiWorker;
//# sourceMappingURL=ai.processor.js.map