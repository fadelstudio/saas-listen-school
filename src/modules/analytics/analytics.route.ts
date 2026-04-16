import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
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
  analyticsController.getDashboard
);

export { router as analyticsRouter };
