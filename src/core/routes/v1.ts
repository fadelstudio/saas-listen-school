import { Router } from "express";

// Import all module routes
import { authRouter }        from "../../modules/auth/auth.route";
import { reportsRouter }     from "../../modules/reports/reports.route";
import { evaluationsRouter } from "../../modules/evaluations/evaluations.route";
import { aiRouter }          from "../../modules/ai/ai.route";
import { decisionsRouter }   from "../../modules/decisions/decisions.route";
import { campusesRouter }    from "../../modules/campuses/campuses.route";
import { classesRouter }     from "../../modules/classes/classes.route";
import { professorsRouter }  from "../../modules/professors/professors.route";
import { academicModulesRouter } from "../../modules/academic-modules/academic-modules.route";
import { levelsRouter }          from "../../modules/levels/levels.route";
import { systemRouter }          from "../../modules/system/system.route";
import { systemController }      from "../../modules/system/system.controller";
import { uploadsRouter }         from "../../modules/uploads/uploads.route";
import { classModulesRouter }    from "../../modules/class-modules/class-modules.route";
import { evaluationCampaignsRouter } from "../../modules/evaluation-campaigns/evaluation-campaigns.route";
import { notificationsRouter } from "../../modules/notifications/notifications.route";
import saasRouter from "../../modules/saas/saas.route";
import { schoolUsersRouter } from "../../modules/school-users/school-users.route";
import { analyticsRouter } from "../../modules/analytics/analytics.route";
import { bulkImportRouter } from "../../modules/bulk-import/bulk-import.route";

const router = Router();

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

router.use("/auth",             authRouter);
router.use("/reports",          reportsRouter);
router.use("/evaluations",      evaluationsRouter);
router.use("/ai",               aiRouter);
router.use("/decisions",        decisionsRouter);
router.use("/campuses",         campusesRouter);
router.use("/classes",          classesRouter);
router.use("/professors",       professorsRouter);
router.use("/academic-modules", academicModulesRouter);
router.use("/levels",           levelsRouter);

// Public bootstrapping endpoint (no auth): expose only toggles.
// Kept here to ensure availability even if module router evolves.
router.get("/system/public", systemController.getPublicSettings);

router.use("/system",           systemRouter);
router.use("/uploads",          uploadsRouter);
router.use("/assignments",      classModulesRouter);
router.use("/evaluation-campaigns", evaluationCampaignsRouter);
router.use("/notifications",        notificationsRouter);
router.use("/saas",             saasRouter);
router.use("/school-users",     schoolUsersRouter);
router.use("/analytics",        analyticsRouter);
router.use("/bulk-import",     bulkImportRouter);

export default router;
