import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { globalAnalysisSchema } from './analytics.schema';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Données agrégées pour le pilotage (Dashboards)
 */

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: "[MANAGER+] Statistiques globales du dashboard"
 *     description: Retourne des compteurs et distributions pour les graphiques.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *         description: Optionnel. Filtrer pour un campus spécifique.
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
router.get(
  '/dashboard',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER, Role.SUPERADMIN),
  analyticsController.getDashboardStats
);

router.get(
  '/time-series',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER, Role.SUPERADMIN),
  analyticsController.getTimeSeriesStats
);

router.post(
  '/generate-periodic-report',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER, Role.SUPERADMIN),
  analyticsController.generatePeriodicReport
);

router.post(
  '/global-analysis',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  validate({ body: globalAnalysisSchema }),
  analyticsController.generateGlobalAnalysis
);

router.get(
  '/reports',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  analyticsController.getReports
);

router.get(
  '/reports/:id',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  analyticsController.getReportById
);

router.post(
  '/generate-periodic-report',
  authMiddleware,
  requireRole(Role.ADMIN, Role.MANAGER),
  analyticsController.generatePeriodicReport
);

/**
 * @swagger
 * /api/analytics/global-analysis:
 *   post:
 *     summary: "[ADMIN+] Lancer une analyse globale IA transversale"
 *     description: Analyse les signalements et évaluations selon des filtres pour générer un rapport et des propositions de décision.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "Audit satisfaction Campus Nord" }
 *               campusId: { type: string, format: uuid }
 *               classId: { type: string, format: uuid }
 *               professorId: { type: string, format: uuid }
 *               moduleId: { type: string, format: uuid }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *               includeReports: { type: boolean, default: true }
 *               includeEvaluations: { type: boolean, default: true }
 *     responses:
 *       200:
 *         description: Analyse terminée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     report: { type: object }
 *                     decisionsCreatedCount: { type: integer }
 *                     aiSummary: { type: string }
 */

export { router as analyticsRouter };
