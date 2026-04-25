import { Router } from 'express';
import { aiController } from './ai.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  chatSchema,
  synthesisSchema,
  aiJobParamsSchema,
  aiJobQuerySchema,
} from './ai.schema';

export const aiRouter = Router();

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
aiRouter.get(
  '/jobs',
  authMiddleware,
  validate({ query: aiJobQuerySchema }),
  aiController.getJobs
);

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
aiRouter.get(
  '/jobs/:jobId',
  authMiddleware,
  validate({ params: aiJobParamsSchema }),
  aiController.getJobById
);

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
aiRouter.get(
  '/jobs/:jobId/result',
  authMiddleware,
  validate({ params: aiJobParamsSchema }),
  aiController.getJobResult
);

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
aiRouter.post(
  '/jobs/:jobId/retry',
  authMiddleware,
  validate({ params: aiJobParamsSchema }),
  aiController.retryJob
);

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
aiRouter.post('/chat', authMiddleware, validate({ body: chatSchema }), (req, res, next) => aiController.chat(req, res, next));

// Direct synchronous chat — no queue, instant response
aiRouter.post('/chat-direct', authMiddleware, (req, res, next) => aiController.chatDirect(req, res, next));

// Conversation history management
aiRouter.get('/conversations', authMiddleware, (req, res, next) => aiController.getConversations(req, res, next));
aiRouter.get('/conversations/:id/messages', authMiddleware, (req, res, next) => aiController.getMessages(req, res, next));
aiRouter.post('/conversations/:id/save', authMiddleware, (req, res, next) => aiController.saveConversation(req, res, next));
aiRouter.delete('/conversations/:id', authMiddleware, (req, res, next) => aiController.deleteConversation(req, res, next));

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
aiRouter.post(
  '/synthesis',
  authMiddleware,
  validate({ body: synthesisSchema }),
  aiController.generateSynthesis
);
