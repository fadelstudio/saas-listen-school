"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemController = void 0;
const system_service_1 = require("./system.service");
const AiBalancer_1 = require("../../core/ai/AiBalancer");
const AppError_1 = require("../../core/errors/AppError");
exports.systemController = {
    async getPublicSettings(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const settings = await system_service_1.systemService.getPublicSettings(req.schoolId);
            res.sendSuccess('Public settings fetched', settings);
        }
        catch (error) {
            next(error);
        }
    },
    async getSettings(req, res, next) {
        try {
            const schoolId = req.schoolId;
            if (!schoolId)
                throw new AppError_1.BadRequestError('schoolId is required');
            const settings = await system_service_1.systemService.getSettings(schoolId);
            res.sendSuccess('Settings fetched successfully', settings);
        }
        catch (error) {
            next(error);
        }
    },
    async updateSettings(req, res, next) {
        try {
            const schoolId = req.schoolId;
            if (!schoolId)
                throw new AppError_1.BadRequestError('schoolId context missing');
            const settings = await system_service_1.systemService.updateSettings(schoolId, req.body);
            res.sendSuccess('Settings updated successfully', settings);
        }
        catch (error) {
            next(error);
        }
    },
    async getAiStatus(req, res, next) {
        try {
            const status = await AiBalancer_1.aiBalancer.getStatus(req.schoolId);
            res.sendSuccess('AI status fetched successfully', status);
        }
        catch (error) {
            next(error);
        }
    },
    async getAiModels(_req, res, next) {
        try {
            const models = await system_service_1.systemService.getAvailableModels();
            res.sendSuccess('Available AI models fetched successfully', models);
        }
        catch (error) {
            next(error);
        }
    },
    async updateLogo(req, res, next) {
        try {
            if (!req.file)
                throw new AppError_1.BadRequestError('Logo file is required');
            const result = await system_service_1.systemService.updateLogo(req.schoolId, req.file);
            res.sendSuccess('Logo updated successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=system.controller.js.map