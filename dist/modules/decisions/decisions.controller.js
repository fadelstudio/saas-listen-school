"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionsController = void 0;
const decisions_service_1 = require("./decisions.service");
const AppError_1 = require("../../core/errors/AppError");
exports.decisionsController = {
    async create(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await decisions_service_1.decisionsService.create(req.body, req.user.userId, req.user.role, req.schoolId);
            res.sendSuccess('Decision created', result, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await decisions_service_1.decisionsService.getAll(req.query, req.schoolId, req.user?.role, req.user?.campusIds);
            res.sendSuccess('Decisions fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await decisions_service_1.decisionsService.getById(req.params.id, req.schoolId, decisions_service_1.decisionsService.resolveScopedCampusIds(req.user?.role, req.user?.campusIds));
            res.sendSuccess('Decision fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await decisions_service_1.decisionsService.update(req.params.id, req.body, req.user.role, req.schoolId);
            res.sendSuccess('Decision updated', result);
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await decisions_service_1.decisionsService.updateStatus(req.params.id, req.body.status, req.user.role, req.schoolId);
            res.sendSuccess('Decision status updated', result);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            await decisions_service_1.decisionsService.delete(req.params.id, req.user.role, req.schoolId);
            res.sendSuccess('Decision deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=decisions.controller.js.map