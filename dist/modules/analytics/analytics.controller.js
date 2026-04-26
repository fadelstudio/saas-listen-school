"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
const AppError_1 = require("../../core/errors/AppError");
exports.analyticsController = {
    async getDashboardStats(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const campusId = req.query.campusId;
            const stats = await analytics_service_1.analyticsService.getDashboardStats(req.schoolId, campusId);
            res.sendSuccess('Analytics dashboard stats fetched', stats);
        }
        catch (error) {
            next(error);
        }
    },
    async getTimeSeriesStats(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const campusId = req.query.campusId;
            const period = req.query.period || 'week';
            const stats = await analytics_service_1.analyticsService.getTimeSeriesStats(req.schoolId, period, campusId);
            res.sendSuccess('Time series stats fetched', stats);
        }
        catch (error) {
            next(error);
        }
    },
    async generateGlobalAnalysis(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await analytics_service_1.analyticsService.generateGlobalAnalysis(req.body, req.user.userId, req.schoolId);
            res.sendSuccess('Global analysis report generated successfully', result);
        }
        catch (error) {
            next(error);
        }
    },
    async getReports(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const page = req.query.page ? parseInt(req.query.page) : undefined;
            const periodic = req.query.periodic === 'true' ? true : (req.query.periodic === 'false' ? false : undefined);
            const q = req.query.q;
            const result = await analytics_service_1.analyticsService.getReports(req.schoolId, { limit, page, periodic, q });
            res.sendSuccess('Analysis reports fetched', result);
        }
        catch (error) {
            next(error);
        }
    },
    async getReportById(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const report = await analytics_service_1.analyticsService.getReportById(req.params.id, req.schoolId);
            res.sendSuccess('Analysis report details fetched', report);
        }
        catch (error) {
            next(error);
        }
    },
    async generatePeriodicReport(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await analytics_service_1.analyticsService.generatePeriodicReport(req.schoolId, req.user.userId);
            res.sendSuccess('Periodic analysis report generated successfully', result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=analytics.controller.js.map