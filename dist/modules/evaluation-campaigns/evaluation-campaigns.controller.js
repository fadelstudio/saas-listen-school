"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationCampaignsController = void 0;
const evaluation_campaigns_service_1 = require("./evaluation-campaigns.service");
const AppError_1 = require("../../core/errors/AppError");
exports.evaluationCampaignsController = {
    async create(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const campaign = await evaluation_campaigns_service_1.evaluationCampaignsService.create(req.body, req.schoolId, req.user?.role, req.user?.campusIds, req.user?.userId);
            res.sendSuccess('Evaluation campaign created and students notified', campaign, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const result = await evaluation_campaigns_service_1.evaluationCampaignsService.getAll(req.schoolId, req.query, req.user?.role, req.user?.classId, req.user?.campusIds, req.user?.userId);
            res.sendSuccess('Campaigns retrieved', result.items, 200, {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
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
            const campaign = await evaluation_campaigns_service_1.evaluationCampaignsService.getById(req.params.id, req.schoolId, req.user?.role, req.user?.campusIds);
            res.sendSuccess('Campaign details', campaign);
        }
        catch (error) {
            next(error);
        }
    },
    async close(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const campaign = await evaluation_campaigns_service_1.evaluationCampaignsService.close(req.params.id, req.schoolId, req.user?.role, req.user?.campusIds, req.user?.userId);
            res.sendSuccess('Campaign closed', campaign);
        }
        catch (error) {
            next(error);
        }
    },
    async getAnalytics(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const data = await evaluation_campaigns_service_1.evaluationCampaignsService.getAnalytics(req.params.id, req.schoolId, req.user?.role, req.user?.campusIds);
            res.sendSuccess('Analytics fetched', data);
        }
        catch (error) {
            next(error);
        }
    },
    async analyze(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const data = await evaluation_campaigns_service_1.evaluationCampaignsService.generatePostDeadlineAnalysis(req.params.id, req.user.userId, req.schoolId, req.user?.role);
            res.sendSuccess('Analysis completed and decision created', data);
        }
        catch (error) {
            next(error);
        }
    },
    async remind(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            await evaluation_campaigns_service_1.evaluationCampaignsService.sendReminders(req.params.id, req.schoolId, req.user?.role, req.user?.campusIds, req.user?.userId);
            res.sendSuccess('Reminders sent successfully');
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=evaluation-campaigns.controller.js.map