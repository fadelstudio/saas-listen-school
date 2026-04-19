"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = void 0;
const ai_service_1 = require("./ai.service");
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
    async chat(req, res, next) {
        try {
            const result = await ai_service_1.aiService.chat(req.body, req.user.userId);
            res.sendSuccess('Chat query submitted', result);
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