"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = void 0;
const ai_service_1 = require("./ai.service");
const chat_service_1 = require("./chat.service");
const AppError_1 = require("../../core/errors/AppError");
exports.aiController = {
    async getJobs(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await ai_service_1.aiService.getJobs(req.query, req.schoolId);
            res.sendSuccess('AI jobs fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async getJobById(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await ai_service_1.aiService.getJobById(req.params.jobId, req.schoolId);
            res.sendSuccess('AI job fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async getJobResult(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await ai_service_1.aiService.getJobResult(req.params.jobId, req.schoolId);
            res.sendSuccess('AI job result', result);
        }
        catch (error) {
            next(error);
        }
    },
    async retryJob(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await ai_service_1.aiService.retryJob(req.params.jobId, req.user.role, req.schoolId);
            res.sendSuccess('AI job retried', result);
        }
        catch (error) {
            next(error);
        }
    },
    // ── Legacy queue-based chat (kept for backward compat) ────────────────────
    async chat(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await ai_service_1.aiService.chat(req.body, req.user.userId, req.schoolId);
            res.sendSuccess('Chat query submitted', result);
        }
        catch (error) {
            next(error);
        }
    },
    // ── NEW: Direct synchronous chat (< 2s, no queue) ─────────────────────────
    async chatDirect(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const { question, conversationId, filters } = req.body;
            if (!question?.trim())
                throw new AppError_1.BadRequestError('question is required');
            const result = await chat_service_1.chatService.askDirect(question.trim(), req.schoolId, req.user.userId, conversationId, filters);
            res.sendSuccess('Chat response', result);
        }
        catch (error) {
            next(error);
        }
    },
    // ── Conversation management ───────────────────────────────────────────────
    async getConversations(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await chat_service_1.chatService.getConversations(req.schoolId, req.user.userId);
            res.sendSuccess('Conversations fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async getMessages(req, res, next) {
        try {
            const result = await chat_service_1.chatService.getMessages(req.params.id);
            res.sendSuccess('Messages fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async saveConversation(req, res, next) {
        try {
            const result = await chat_service_1.chatService.saveConversation(req.params.id);
            res.sendSuccess('Conversation saved', result);
        }
        catch (error) {
            next(error);
        }
    },
    async deleteConversation(req, res, next) {
        try {
            const result = await chat_service_1.chatService.deleteConversation(req.params.id);
            res.sendSuccess('Conversation deleted', result);
        }
        catch (error) {
            next(error);
        }
    },
    async generateSynthesis(req, res, next) {
        try {
            const result = await ai_service_1.aiService.generateSynthesis(req.body, req.user.role);
            res.sendSuccess('Synthesis job submitted', result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=ai.controller.js.map