"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsController = void 0;
const reports_service_1 = require("./reports.service");
exports.reportsController = {
    async create(req, res, next) {
        try {
            const userId = req.user?.userId; // may be undefined (anonymous)
            const report = await reports_service_1.reportsService.create(req.body, userId);
            res.sendSuccess('Report created successfully', report, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            const result = await reports_service_1.reportsService.getAll(req.query);
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
            const report = await reports_service_1.reportsService.getById(req.params.id);
            res.sendSuccess('Report fetched', report);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const report = await reports_service_1.reportsService.update(req.params.id, req.body, req.user.userId, req.user.role);
            res.sendSuccess('Report updated', report);
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const report = await reports_service_1.reportsService.updateStatus(req.params.id, req.body.status, req.user.role);
            res.sendSuccess('Report status updated', report);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await reports_service_1.reportsService.delete(req.params.id, req.user.role);
            res.sendSuccess('Report deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
    async analyze(req, res, next) {
        try {
            const result = await reports_service_1.reportsService.triggerAiAnalysis(req.params.id, req.user.role);
            res.sendSuccess('AI analysis job queued', result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=reports.controller.js.map