"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Import all module routes
const auth_route_1 = require("../../modules/auth/auth.route");
const reports_route_1 = require("../../modules/reports/reports.route");
const evaluations_route_1 = require("../../modules/evaluations/evaluations.route");
const ai_route_1 = require("../../modules/ai/ai.route");
const decisions_route_1 = require("../../modules/decisions/decisions.route");
const campuses_route_1 = require("../../modules/campuses/campuses.route");
const classes_route_1 = require("../../modules/classes/classes.route");
const professors_route_1 = require("../../modules/professors/professors.route");
const academic_modules_route_1 = require("../../modules/academic-modules/academic-modules.route");
const levels_route_1 = require("../../modules/levels/levels.route");
const system_route_1 = require("../../modules/system/system.route");
const system_controller_1 = require("../../modules/system/system.controller");
const uploads_route_1 = require("../../modules/uploads/uploads.route");
const class_modules_route_1 = require("../../modules/class-modules/class-modules.route");
const evaluation_campaigns_route_1 = require("../../modules/evaluation-campaigns/evaluation-campaigns.route");
const notifications_route_1 = require("../../modules/notifications/notifications.route");
const saas_route_1 = __importDefault(require("../../modules/saas/saas.route"));
const school_users_route_1 = require("../../modules/school-users/school-users.route");
const analytics_route_1 = require("../../modules/analytics/analytics.route");
const bulk_import_route_1 = require("../../modules/bulk-import/bulk-import.route");
const audit_route_1 = __importDefault(require("../../modules/audit/audit.route"));
const announcements_route_1 = require("../../modules/announcements/announcements.route");
const resolveSchool_middleware_1 = require("../middleware/resolveSchool.middleware");
const router = (0, express_1.Router)();
// Basic API v1 info (non-sensitive)
/**
 * @swagger
 * /api/v1:
 *   get:
 *     summary: Informations non sensibles sur l'API v1
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Métadonnées (version, env, liens utiles)
 */
router.get("/", (_req, res) => {
    res.sendSuccess("AFI-LISTEN API v1", {
        name: "saas-listen-school",
        version: process.env.npm_package_version ?? "unknown",
        node: process.version,
        environment: process.env.NODE_ENV ?? "unknown",
        docs: "/api-docs",
        health: "/health",
        apiBase: "/api/v1",
        serverTime: new Date().toISOString(),
    });
});
// Global/tenant-management endpoints that are not scoped to a resolved school.
router.use("/saas", saas_route_1.default);
// Tenant resolution is mandatory for all school-scoped business routes.
router.use(resolveSchool_middleware_1.resolveSchoolMiddleware);
router.use("/auth", auth_route_1.authRouter);
router.use("/reports", reports_route_1.reportsRouter);
router.use("/evaluations", evaluations_route_1.evaluationsRouter);
router.use("/ai", ai_route_1.aiRouter);
router.use("/decisions", decisions_route_1.decisionsRouter);
router.use("/campuses", campuses_route_1.campusesRouter);
router.use("/classes", classes_route_1.classesRouter);
router.use("/professors", professors_route_1.professorsRouter);
router.use("/academic-modules", academic_modules_route_1.academicModulesRouter);
router.use("/levels", levels_route_1.levelsRouter);
// Public bootstrapping endpoint (no auth): expose only toggles.
// Kept here to ensure availability even if module router evolves.
router.get("/system/public", system_controller_1.systemController.getPublicSettings);
router.use("/system", system_route_1.systemRouter);
router.use("/uploads", uploads_route_1.uploadsRouter);
router.use("/assignments", class_modules_route_1.classModulesRouter);
router.use("/evaluation-campaigns", evaluation_campaigns_route_1.evaluationCampaignsRouter);
router.use("/notifications", notifications_route_1.notificationsRouter);
router.use("/school-users", school_users_route_1.schoolUsersRouter);
router.use("/analytics", analytics_route_1.analyticsRouter);
router.use("/bulk-import", bulk_import_route_1.bulkImportRouter);
router.use("/audit", audit_route_1.default);
router.use("/announcements", announcements_route_1.announcementsRouter);
exports.default = router;
//# sourceMappingURL=v1.js.map