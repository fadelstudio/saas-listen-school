"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemRouter = void 0;
const express_1 = require("express");
const system_controller_1 = require("./system.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const system_schema_1 = require("./system.schema");
const client_1 = require("@prisma/client");
exports.systemRouter = (0, express_1.Router)();
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
exports.systemRouter.get('/public', system_controller_1.systemController.getPublicSettings);
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
exports.systemRouter.get('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), system_controller_1.systemController.getSettings);
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
exports.systemRouter.patch('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ body: system_schema_1.updateSystemSettingsSchema }), system_controller_1.systemController.updateSettings);
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
exports.systemRouter.get('/ai-status', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), system_controller_1.systemController.getAiStatus);
//# sourceMappingURL=system.route.js.map