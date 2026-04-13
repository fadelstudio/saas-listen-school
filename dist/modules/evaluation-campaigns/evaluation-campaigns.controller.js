"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationCampaignsController = void 0;
const evaluation_campaigns_service_1 = require("./evaluation-campaigns.service");
exports.evaluationCampaignsController = {
    async create(req, res, next) {
        try {
            const campaign = await evaluation_campaigns_service_1.evaluationCampaignsService.create(req.body);
            res.sendSuccess('Evaluation campaign created and students notified', campaign, 201);
        }
        catch (error) {
            next(error);
        }
    },
    async getAll(req, res, next) {
        try {
            const result = await evaluation_campaigns_service_1.evaluationCampaignsService.getAll(req.query);
            res.sendSuccess('Campaigns retrieved', result.items, 200, {
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
            const campaign = await evaluation_campaigns_service_1.evaluationCampaignsService.getById(req.params.id);
            res.sendSuccess('Campaign details', campaign);
        }
        catch (error) {
            next(error);
        }
    },
    async close(req, res, next) {
        try {
            const campaign = await evaluation_campaigns_service_1.evaluationCampaignsService.close(req.params.id);
            res.sendSuccess('Campaign closed', campaign);
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=evaluation-campaigns.controller.js.map