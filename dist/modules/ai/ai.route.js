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
 *   description: Analytique IA, Assistant Chat (RAG) et Suivi des traitements asynchrones
 */
/**
 * @swagger
 * /api/ai/jobs:
 *   get:
 *     summary: "Liste des jobs IA"
 *     description: Récupère l'historique des tâches de fond (Analyses, Synthèses, Chat).
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobType
 *         schema: { type: string, enum: [REPORT_ANALYSIS, EVALUATION_SCORING, SYNTHESIS, CHAT] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, PROCESSING, COMPLETED, FAILED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste des tâches récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/AiJob' } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
exports.aiRouter.get('/jobs', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: ai_schema_1.aiJobQuerySchema }), ai_controller_1.aiController.getJobs);
/**
 * @swagger
 * /api/ai/jobs/{jobId}:
 *   get:
 *     summary: "Détail et Statut d'un job IA"
 *     description: Permet de savoir si un traitement en cours est terminé ou a échoué.
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
 *         description: Statut actuel du Job
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AiJob'
 */
exports.aiRouter.get('/jobs/:jobId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: ai_schema_1.aiJobParamsSchema }), ai_controller_1.aiController.getJobById);
/**
 * @swagger
 * /api/ai/jobs/{jobId}/result:
 *   get:
 *     summary: "Résultat final d'un job IA"
 *     description: Récupère les données produites par l'IA une fois le statut COMPLETED.
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
 *         description: Données synthétisées ou réponse assistant
 */
exports.aiRouter.get('/jobs/:jobId/result', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: ai_schema_1.aiJobParamsSchema }), ai_controller_1.aiController.getJobResult);
/**
 * @swagger
 * /api/ai/jobs/{jobId}/retry:
 *   post:
 *     summary: "Relancer un job échoué"
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
 *         description: Job ré-enqueué dans BullMQ
 */
exports.aiRouter.post('/jobs/:jobId/retry', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: ai_schema_1.aiJobParamsSchema }), ai_controller_1.aiController.retryJob);
/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: "Poser une question à l'assistant IA (RAG)"
 *     description: |
 *       Pose une question sur les données de l'école.
 *       L'IA utilise le contexte (Signalements/Évals) pour répondre.
 *       Traitement asynchrone : retourne un `jobId`.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question: { type: string, example: "Quel est le problème principal en Salle 12 ?" }
 *     responses:
 *       200:
 *         description: Traitement lancé. Récupérez le résultat via /api/ai/jobs/{jobId}/result
 */
exports.aiRouter.post('/chat', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: ai_schema_1.chatSchema }), ai_controller_1.aiController.chat);
/**
 * @swagger
 * /api/ai/synthesis:
 *   post:
 *     summary: "Générer une synthèse périodique"
 *     description: Analyse globale de la température du campus ou du module.
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
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Synthèse en file d'attente.
 */
exports.aiRouter.post('/synthesis', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: ai_schema_1.synthesisSchema }), ai_controller_1.aiController.generateSynthesis);
//# sourceMappingURL=ai.route.js.map