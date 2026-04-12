import { Router } from 'express';
import { systemController } from './system.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { updateSystemSettingsSchema } from './system.schema';
import { Role } from '@prisma/client';

export const systemRouter = Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: Paramètres globaux et configuration IA
 */

/**
 * @swagger
 * /api/system:
 *   get:
 *     summary: Récupérer les paramètres système (Admin)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Objet SystemSettings
 */
systemRouter.get(
  '/',
  authMiddleware,
  requireRole(Role.ADMIN),
  systemController.getSettings
);

/**
 * @swagger
 * /api/system:
 *   patch:
 *     summary: Mettre à jour les paramètres (Admin)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolName: { type: string, example: "AFI-L'Université" }
 *               aiEnabled: { type: boolean, example: true }
 *               authReportsRequired: { type: boolean, example: false }
 *               authEvaluationsRequired: { type: boolean, example: false }
 *               aiConfigs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *                     provider: { type: string }
 *                     model: { type: string }
 *                     apiKey: { type: string }
 *                     priority: { type: number }
 *                     isFree: { type: boolean }
 *               aiOverrideConfigId: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Paramètres mis à jour
 */
systemRouter.patch(
  '/',
  authMiddleware,
  requireRole(Role.ADMIN),
  validate({ body: updateSystemSettingsSchema }),
  systemController.updateSettings
);

/**
 * @swagger
 * /api/system/ai-status:
 *   get:
 *     summary: Voir le statut du balancer IA (sur quel modèle il tourne)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut IA
 */
systemRouter.get(
  '/ai-status',
  authMiddleware,
  requireRole(Role.ADMIN),
  systemController.getAiStatus
);
