"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemController = void 0;
const system_service_1 = require("./system.service");
const AiBalancer_1 = require("../../core/ai/AiBalancer");
exports.systemController = {
    async getSettings(_req, res, next) {
        try {
            const settings = await system_service_1.systemService.getSettings();
            res.sendSuccess('Settings fetched successfully', settings);
        }
        catch (error) {
            next(error);
        }
    },
    async updateSettings(req, res, next) {
        try {
            const settings = await system_service_1.systemService.updateSettings(req.body);
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