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
exports.systemRouter.get('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), system_controller_1.systemController.getSettings);
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
exports.systemRouter.patch('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ body: system_schema_1.updateSystemSettingsSchema }), system_controller_1.systemController.updateSettings);
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
exports.systemRouter.get('/ai-status', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), system_controller_1.systemController.getAiStatus);
//# sourceMappingURL=system.route.js.map