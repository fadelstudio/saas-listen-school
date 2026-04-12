"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const ai_repository_1 = require("./ai.repository");
const queue_1 = require("../../core/config/queue");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
exports.aiService = {
    async getJobById(jobId) {
        const job = await ai_repository_1.aiRepository.findJobById(jobId);
        if (!job)
            throw new AppError_1.NotFoundError('AI Job');
        return job;
    },
    async getJobs(query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            status: query.status,
            jobType: query.jobType,
            reportId: query.reportId,
            evaluationId: query.evaluationId,
        };
        const { items, total } = await ai_repository_1.aiRepository.findJobs(filters, pagination);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getJobResult(jobId) {
        const job = await ai_repository_1.aiRepository.findJobById(jobId);
        if (!job)
            throw new AppError_1.NotFoundError('AI Job');
        return { status: job.status, result: job.result, errorMessage: job.errorMessage };
    },
    async retryJob(jobId, userRole) {
        if (userRole !== 'ADMIN')
            throw new AppError_1.ForbiddenError('Only ADMIN can retry AI jobs');
        const job = await ai_repository_1.aiRepository.findJobById(jobId);
        if (!job)
            throw new AppError_1.NotFoundError('AI Job');
        await queue_1.jobQueue.add('ai-analysis', job.payload);
        return { retried: true, jobId };
    },
    async chat(input, userId) {
        const bullJob = await queue_1.jobQueue.add('ai-analysis', {
            type: 'chat-query',
            question: input.question,
            userId,
        });
        return { jobId: bullJob.id, message: 'Chat query queued — poll /api/ai/jobs/:jobId/result' };
    },
    async generateSynthesis(input, userRole) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can generate synthesis');
        }
        const bullJob = await queue_1.jobQueue.add('ai-analysis', {
            type: 'global-synthesis',
            startDate: input.startDate,
            endDate: input.endDate,
        });
        return { jobId: bullJob.id, message: 'Synthesis job queued — poll /api/ai/jobs/:jobId/result' };
    },
};
//# sourceMappingURL=ai.service.js.map