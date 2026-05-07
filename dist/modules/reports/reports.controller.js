"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsController = void 0;
const reports_service_1 = require("./reports.service");
const AppError_1 = require("../../core/errors/AppError");
exports.reportsController = {
    async create(req, res, next) {
        try {
            const userId = req.user?.userId; // may be undefined (anonymous)
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const report = await reports_service_1.reportsService.create(req.body, userId, req.schoolId);
            res.sendSuccess('Report created successfully', report, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await reports_service_1.reportsService.getAll(req.query, req.user?.role, req.schoolId, req.user?.campusIds);
            res.sendSuccess('Reports fetched', result.items, 200, {
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
            const report = await reports_service_1.reportsService.getById(req.params.id, req.user?.role, req.schoolId, req.user?.campusIds);
            res.sendSuccess('Report fetched', report);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const report = await reports_service_1.reportsService.update(req.params.id, req.body, req.user.userId, req.user.role, req.schoolId);
            res.sendSuccess('Report updated', report);
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const report = await reports_service_1.reportsService.updateStatus(req.params.id, req.body.status, req.user.role, req.schoolId);
            res.sendSuccess('Report status updated', report);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            await reports_service_1.reportsService.delete(req.params.id, req.user.role, req.schoolId);
            res.sendSuccess('Report deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
    async analyze(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await reports_service_1.reportsService.triggerAiAnalysis(req.params.id, req.user.role, req.schoolId);
            res.sendSuccess('AI analysis job queued', result);
        }
        catch (error) {
            next(error);
        }
    },
    async getMyReports(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const userId = req.user.userId;
            const result = await reports_service_1.reportsService.getMyReports(userId, req.query, req.schoolId);
            res.sendSuccess('My reports fetched', result.items, 200, {
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
};
//# sourceMappingURL=reports.controller.js.map