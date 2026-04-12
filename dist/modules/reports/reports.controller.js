"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsController = void 0;
const reports_service_1 = require("./reports.service");
const response_1 = require("../../utils/response");
exports.reportsController = {
    async create(req, res, next) {
        try {
            const userId = req.user?.userId; // may be undefined (anonymous)
            const report = await reports_service_1.reportsService.create(req.body, userId);
            (0, response_1.sendSuccess)(res, 'Report created successfully', report, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            const result = await reports_service_1.reportsService.getAll(req.query);
            (0, response_1.sendSuccess)(res, 'Reports fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async getById(req, res, next) {
        try {
            const report = await reports_service_1.reportsService.getById(req.params.id);
            (0, response_1.sendSuccess)(res, 'Report fetched', report);
        }
        catch (error) {
            next(error);
        }
    },
    async update(req, res, next) {
        try {
            const report = await reports_service_1.reportsService.update(req.params.id, req.body, req.user.userId, req.user.role);
            (0, response_1.sendSuccess)(res, 'Report updated', report);
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const report = await reports_service_1.reportsService.updateStatus(req.params.id, req.body.status, req.user.role);
            (0, response_1.sendSuccess)(res, 'Report status updated', report);
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await reports_service_1.reportsService.delete(req.params.id, req.user.role);
            (0, response_1.sendSuccess)(res, 'Report deleted', null);
        }
        catch (error) {
            next(error);
        }
    },
    async analyze(req, res, next) {
        try {
            const result = await reports_service_1.reportsService.triggerAiAnalysis(req.params.id, req.user.role);
            (0, response_1.sendSuccess)(res, 'AI analysis job queued', result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=reports.controller.js.map