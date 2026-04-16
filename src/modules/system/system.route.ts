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
 *   description: Paramètres globaux, configuration de l'IA (Gemini/OpenAI) et règles métier (AUTH)
 */

/**
 * @swagger
 * /api/system:
 *   get:
 *     summary: "Récupérer la configuration globale du système (ADMIN+)"
 *     description: Retourne les réglages de visibilité, les exigences d'authentification pour les signalements et les modèles IA actifs.
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Objet de configuration chargé depuis la base de données.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: object }
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
 *     summary: "Mettre à jour les réglages système (ADMIN+)"
 *     description: Permet de changer le nom de l'école ou de basculer l'IA.
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
 *               schoolName: { type: string, example: "Groupe AFI Dakar" }
 *               aiEnabled: { type: boolean, example: true, description: "Désactiver l'IA globalement si besoin" }
 *               authReportsRequired: { type: boolean, example: false, description: "Exiger un compte pour signaler un incident" }
 *               authEvaluationsRequired: { type: boolean, example: false, description: "Exiger un compte pour évaluer un professeur" }
 *               aiConfigs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string, example: "Gemini Pro Direct" }
 *                     provider: { type: string, enum: [GOOGLE, OPENAI] }
 *                     model: { type: string, example: "gemini-1.5-pro" }
 *                     apiKey: { type: string }
 *                     priority: { type: number, example: 1, description: "Ordre d'utilisation (Balancer)" }
 *               aiOverrideConfigId: { type: string, nullable: true, description: "Forcer un modèle spécifique" }
 *     responses:
 *       200:
 *         description: Configuration mise à jour et appliquée immédiatement.
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
 *     summary: "Statut temps réel du Balancer IA"
 *     description: Identifie quel modèle est actuellement utilisé et si le quota est épuisé.
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Healthcheck de la couche IA
 */
systemRouter.get(
  '/ai-status',
  authMiddleware,
  requireRole(Role.ADMIN),
  systemController.getAiStatus
);
