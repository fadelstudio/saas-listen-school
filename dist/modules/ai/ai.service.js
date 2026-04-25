"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    async chat(input, userId, schoolId) {
        const { chatService } = await Promise.resolve().then(() => __importStar(require('./chat.service')));
        let conversationId = input.conversationId;
        if (!conversationId) {
            const conv = await chatService.createConversation(schoolId, userId, input.question);
            conversationId = conv.id;
        }
        // Save user message
        await chatService.addMessage(conversationId, 'user', input.question);
        try {
            const bullJob = await queue_1.jobQueue.add('ai-analysis', {
                type: 'chat-query',
                question: input.question,
                userId,
                conversationId, // Pass this to the worker
            });
            return { queued: true, jobId: bullJob.id, conversationId, message: 'Chat query queued' };
        }
        catch (error) {
            logger_1.logger.warn('Could not enqueue AI chat (Redis down?)', { error });
            const dbJob = await ai_repository_1.aiRepository.createJob({
                jobType: 'chat-query',
                status: client_1.AiJobStatus.FAILED,
                payload: { type: 'chat-query', question: input.question, userId, conversationId },
                errorMessage: 'REDIS_UNAVAILABLE',
            });
            return { queued: false, jobId: dbJob.id, conversationId, reason: 'REDIS_UNAVAILABLE' };
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