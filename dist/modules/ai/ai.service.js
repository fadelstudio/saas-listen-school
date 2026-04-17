"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const ai_repository_1 = require("./ai.repository");
const queue_1 = require("../../core/config/queue");
const AppError_1 = require("../../core/errors/AppError");
const pagination_1 = require("../../utils/pagination");
const logger_1 = require("../../utils/logger");
const client_1 = require("@prisma/client");
exports.aiService = {
    async getJobById(jobId, schoolId) {
        const job = await ai_repository_1.aiRepository.findJobById(jobId, schoolId ?? null);
        if (!job)
            throw new AppError_1.NotFoundError('AI Job');
        return job;
    },
    async getJobs(query, schoolId) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            status: query.status,
            jobType: query.jobType,
            reportId: query.reportId,
            evaluationId: query.evaluationId,
        };
        const { items, total } = await ai_repository_1.aiRepository.findJobs(filters, pagination, schoolId ?? null);
        return (0, pagination_1.buildPaginated)(items, total, pagination.page, pagination.limit);
    },
    async getJobResult(jobId, schoolId) {
        const job = await ai_repository_1.aiRepository.findJobById(jobId, schoolId ?? null);
        if (!job)
            throw new AppError_1.NotFoundError('AI Job');
        return { status: job.status, result: job.result, errorMessage: job.errorMessage };
    },
    async retryJob(jobId, userRole, schoolId) {
        if (userRole !== 'ADMIN')
            throw new AppError_1.ForbiddenError('Only ADMIN can retry AI jobs');
        const job = await ai_repository_1.aiRepository.findJobById(jobId, schoolId ?? null);
        if (!job)
            throw new AppError_1.NotFoundError('AI Job');
        try {
            await queue_1.jobQueue.add('ai-analysis', job.payload);
            return { retried: true, jobId };
        }
        catch (error) {
            logger_1.logger.warn('Could not retry AI job (Redis down?)', { jobId, error });
            return { retried: false, jobId, reason: 'REDIS_UNAVAILABLE' };
        }
    },
    async chat(input, userId) {
        try {
            const bullJob = await queue_1.jobQueue.add('ai-analysis', {
                type: 'chat-query',
                question: input.question,
                userId,
            });
            return { queued: true, jobId: bullJob.id, message: 'Chat query queued — poll /api/ai/jobs/:jobId/result' };
        }
        catch (error) {
            logger_1.logger.warn('Could not enqueue AI chat (Redis down?)', { error });
            const dbJob = await ai_repository_1.aiRepository.createJob({
                jobType: 'chat-query',
                status: client_1.AiJobStatus.FAILED,
                payload: { type: 'chat-query', question: input.question, userId },
                errorMessage: 'REDIS_UNAVAILABLE',
            });
            return { queued: false, jobId: dbJob.id, reason: 'REDIS_UNAVAILABLE' };
        }
    },
    async generateSynthesis(input, userRole) {
        if (!['ADMIN', 'MANAGER'].includes(userRole)) {
            throw new AppError_1.ForbiddenError('Only MANAGER or ADMIN can generate synthesis');
        }
        try {
            const bullJob = await queue_1.jobQueue.add('ai-analysis', {
                type: 'global-synthesis',
                startDate: input.startDate,
                endDate: input.endDate,
            });
            return { queued: true, jobId: bullJob.id, message: 'Synthesis job queued — poll /api/ai/jobs/:jobId/result' };
        }
        catch (error) {
            logger_1.logger.warn('Could not enqueue AI synthesis (Redis down?)', { error });
            const dbJob = await ai_repository_1.aiRepository.createJob({
                jobType: 'global-synthesis',
                status: client_1.AiJobStatus.FAILED,
                payload: { type: 'global-synthesis', startDate: input.startDate, endDate: input.endDate },
                errorMessage: 'REDIS_UNAVAILABLE',
            });
            return { queued: false, jobId: dbJob.id, reason: 'REDIS_UNAVAILABLE' };
        }
    },
};
//# sourceMappingURL=ai.service.js.map