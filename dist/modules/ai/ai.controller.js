"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = void 0;
const ai_service_1 = require("./ai.service");
const response_1 = require("../../utils/response");
exports.aiController = {
    async getJobs(req, res, next) {
        try {
            const result = await ai_service_1.aiService.getJobs(req.query);
            (0, response_1.sendSuccess)(res, 'AI jobs fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async getJobById(req, res, next) {
        try {
            const result = await ai_service_1.aiService.getJobById(req.params.jobId);
            (0, response_1.sendSuccess)(res, 'AI job fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async getJobResult(req, res, next) {
        try {
            const result = await ai_service_1.aiService.getJobResult(req.params.jobId);
            (0, response_1.sendSuccess)(res, 'AI job result', result);
        }
        catch (error) {
            next(error);
        }
    },
    async retryJob(req, res, next) {
        try {
            const result = await ai_service_1.aiService.retryJob(req.params.jobId, req.user.role);
            (0, response_1.sendSuccess)(res, 'AI job retried', result);
        }
        catch (error) {
            next(error);
        }
    },
    async chat(req, res, next) {
        try {
            const result = await ai_service_1.aiService.chat(req.body, req.user.userId);
            (0, response_1.sendSuccess)(res, 'Chat query submitted', result);
        }
        catch (error) {
            next(error);
        }
    },
    async generateSynthesis(req, res, next) {
        try {
            const result = await ai_service_1.aiService.generateSynthesis(req.body, req.user.role);
            (0, response_1.sendSuccess)(res, 'Synthesis job submitted', result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=ai.controller.js.map