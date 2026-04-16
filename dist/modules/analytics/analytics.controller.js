"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
exports.analyticsController = {
    async getDashboard(req, res, next) {
        try {
            const campusId = req.query.campusId;
            const stats = await analytics_service_1.analyticsService.getDashboardStats(campusId);
            res.sendSuccess('Dashboard analytics fetched', stats);
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=analytics.controller.js.map