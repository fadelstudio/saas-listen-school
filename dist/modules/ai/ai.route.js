"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const ai_controller_1 = require("./ai.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const ai_schema_1 = require("./ai.schema");
exports.aiRouter = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: AI
 *   description: Analytique IA, Chat et Suivi des Jobs
 */
/**
 * @swagger
 * /api/ai/jobs:
 *   get:
 *     summary: Liste des jobs IA
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tâches de fond IA
 */
exports.aiRouter.get('/jobs', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: ai_schema_1.aiJobQuerySchema }), ai_controller_1.aiController.getJobs);
/**
 * @swagger
 * /api/ai/jobs/{jobId}:
 *   get:
 *     summary: Détail d'un job IA
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Statut et détails du job
 */
exports.aiRouter.get('/jobs/:jobId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: ai_schema_1.aiJobParamsSchema }), ai_controller_1.aiController.getJobById);
/**
 * @swagger
 * /api/ai/jobs/{jobId}/result:
 *   get:
 *     summary: Résultat d'un job terminé
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Données synthétisées par l'IA
 */
exports.aiRouter.get('/jobs/:jobId/result', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: ai_schema_1.aiJobParamsSchema }), ai_controller_1.aiController.getJobResult);
/**
 * @swagger
 * /api/ai/jobs/{jobId}/retry:
 *   post:
 *     summary: Relancer un job échoué
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Job re-enqueué
 */
exports.aiRouter.post('/jobs/:jobId/retry', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: ai_schema_1.aiJobParamsSchema }), ai_controller_1.aiController.retryJob);
/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Poser une question à l'assistant IA (RAG)
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               context: { type: string, enum: [REPORTS, EVALUATIONS, GENERAL] }
 *     responses:
 *       202:
 *         description: Job de chat créé (suivre jobId)
 */
exports.aiRouter.post('/chat', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: ai_schema_1.chatSchema }), ai_controller_1.aiController.chat);
/**
 * @swagger
 * /api/ai/synthesis:
 *   post:
 *     summary: Générer une synthèse globale des données
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campusId: { type: string, format: uuid }
 *               moduleId: { type: string, format: uuid }
 *     responses:
 *       202:
 *         description: Job de synthèse lancé
 */
exports.aiRouter.post('/synthesis', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: ai_schema_1.synthesisSchema }), ai_controller_1.aiController.generateSynthesis);
//# sourceMappingURL=ai.route.js.map