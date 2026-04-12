"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationsController = void 0;
const evaluations_service_1 = require("./evaluations.service");
const response_1 = require("../../utils/response");
exports.evaluationsController = {
    async create(req, res, next) {
        try {
            const userId = req.user?.userId;
            const result = await evaluations_service_1.evaluationsService.create(req.body, userId);
            (0, response_1.sendSuccess)(res, 'Evaluation created', result, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            const result = await evaluations_service_1.evaluationsService.getAll(req.query);
            (0, response_1.sendSuccess)(res, 'Evaluations fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const result = await evaluations_service_1.evaluationsService.getById(req.params.id);
            (0, response_1.sendSuccess)(res, 'Evaluation fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const result = await evaluations_service_1.evaluationsService.update(req.params.id, req.body, req.user.userId, req.user.role);
            (0, response_1.sendSuccess)(res, 'Evaluation updated', result);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await evaluations_service_1.evaluationsService.delete(req.params.id, req.user.role);
            (0, response_1.sendSuccess)(res, 'Evaluation deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
    async getStats(req, res, next) {
        try {
            const result = await evaluations_service_1.evaluationsService.getStats(req.query);
            (0, response_1.sendSuccess)(res, 'Evaluation stats', result);
        }
        catch (error) {
            next(error);
        }
    },
    async analyze(req, res, next) {
        try {
            const result = await evaluations_service_1.evaluationsService.triggerAiScoring(req.params.id, req.user.role);
            (0, response_1.sendSuccess)(res, 'AI scoring job queued', result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=evaluations.controller.js.map