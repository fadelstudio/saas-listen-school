"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationsController = void 0;
const evaluations_service_1 = require("./evaluations.service");
const AppError_1 = require("../../core/errors/AppError");
exports.evaluationsController = {
    async create(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await evaluations_service_1.evaluationsService.create(req.body, userId, req.schoolId);
            res.sendSuccess('Evaluation created', result, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await evaluations_service_1.evaluationsService.getAll(req.query, req.user?.role, req.schoolId);
            res.sendSuccess('Evaluations fetched', result.items, 200, {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await evaluations_service_1.evaluationsService.getById(req.params.id, req.user?.role, req.schoolId);
            res.sendSuccess('Evaluation fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await evaluations_service_1.evaluationsService.update(req.params.id, req.body, req.user.userId, req.user.role, req.schoolId);
            res.sendSuccess('Evaluation updated', result);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            await evaluations_service_1.evaluationsService.delete(req.params.id, req.user.role, req.schoolId);
            res.sendSuccess('Evaluation deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
    async getStats(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await evaluations_service_1.evaluationsService.getStats(req.query, req.schoolId);
            res.sendSuccess('Evaluation stats', result);
        }
        catch (error) {
            next(error);
        }
    },
    async analyze(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await evaluations_service_1.evaluationsService.triggerAiScoring(req.params.id, req.user.role, req.schoolId);
            res.sendSuccess('AI scoring job queued', result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=evaluations.controller.js.map