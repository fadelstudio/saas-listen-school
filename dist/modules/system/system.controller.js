"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemController = void 0;
const system_service_1 = require("./system.service");
const AiBalancer_1 = require("../../core/ai/AiBalancer");
const AppError_1 = require("../../core/errors/AppError");
exports.systemController = {
    async getPublicSettings(_req, res, next) {
        try {
            // Single-school friendly: expose only non-sensitive toggles to bootstrap clients.
            const settings = await system_service_1.systemService.getPublicSettings();
            res.sendSuccess('Public settings fetched', settings);
        }
        catch (error) {
            next(error);
        }
    },
    async getSettings(req, res, next) {
        try {
            const schoolId = req.user.schoolId;
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
            const schoolId = req.user.schoolId;
            if (!schoolId)
                throw new AppError_1.BadRequestError('schoolId context missing');
            const settings = await system_service_1.systemService.updateSettings(schoolId, req.body);
            res.sendSuccess('Settings updated successfully', settings);
        }
        catch (error) {
            next(error);
        }
    },
    async getAiStatus(_req, res, next) {
        try {
            const status = AiBalancer_1.aiBalancer.getStatus();
            res.sendSuccess('AI status fetched successfully', status);
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=system.controller.js.map