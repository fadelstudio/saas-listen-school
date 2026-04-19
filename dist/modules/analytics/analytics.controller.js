"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
const AppError_1 = require("../../core/errors/AppError");
exports.analyticsController = {
    async getDashboard(req, res, next) {
        try {
            if (!req.schoolId)
                throw new AppError_1.BadRequestError('school context is required');
            const campusId = req.query.campusId;
            const stats = await analytics_service_1.analyticsService.getDashboardStats(req.schoolId, campusId);
            res.sendSuccess('Dashboard analytics fetched', stats);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=analytics.controller.js.map