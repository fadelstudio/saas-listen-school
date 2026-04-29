import { Router } from 'express';
import { systemController } from './system.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import { updateSystemSettingsSchema } from './system.schema';
import { Role } from '@prisma/client';
import { profilePhotoUpload } from '../../core/middleware/profilePhotoUpload.middleware';

export const systemRouter = Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: Paramètres globaux, configuration de l'IA (Gemini/OpenAI) et règles métier (AUTH)
 */

/**
 * @swagger
 * /api/system/public:
 *   get:
 *     summary: "Récupérer les toggles publics (bootstrapping frontend)"
 *     description: "Endpoint libre, mais scoppé par école résolue (sous-domaine principal ou x-school-slug fallback). Sans contexte valide: 404."
 *     tags: [System]
 *     parameters:
 *       - $ref: '#/components/parameters/SchoolSlugHeader'
 *     responses:
 *       200:
 *         description: Toggles publics pour l’école détectée (schoolSlug + schoolName alignés sur cette école).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schoolSlug: { type: string, example: "afi-default-school" }
 *                 schoolName: { type: string }
 *                 aiEnabled: { type: boolean }
 *                 authOtpRequired: { type: boolean }
 *                 authReportsRequired: { type: boolean }
 *                 authEvaluationsRequired: { type: boolean }
 *                 updatedAt: { type: string, format: date-time }
 */
systemRouter.get('/public', systemController.getPublicSettings);
systemRouter.get('/public/form-data', systemController.getPublicFormData);

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

systemRouter.get(
  '/ai-status',
  authMiddleware,
  requireRole(Role.ADMIN),
  systemController.getAiStatus
);

/**
 * @swagger
 * /api/system/ai-models:
 *   get:
 *     summary: "Liste des modèles IA disponibles par fournisseur"
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des modèles découverts ou fallbacks.
 */
systemRouter.get(
  '/ai-models',
  authMiddleware,
  requireRole(Role.ADMIN),
  systemController.getAiModels
);

/**
 * @swagger
 * /api/system/logo:
 *   post:
 *     summary: "Mettre à jour le logo de l'école"
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: URL du logo mis à jour.
 */
systemRouter.post(
  '/logo',
  authMiddleware,
  requireRole(Role.ADMIN),
  (req, res, next) => {
    profilePhotoUpload.single('file')(req, res, (err: unknown) => {
      if (err) return next(err);
      next();
    });
  },
  systemController.updateLogo
);
