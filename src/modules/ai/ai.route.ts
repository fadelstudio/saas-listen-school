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
aiRouter.post(
  '/chat',
  authMiddleware,
  validate({ body: chatSchema }),
  aiController.chat
);

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
aiRouter.post(
  '/synthesis',
  authMiddleware,
  validate({ body: synthesisSchema }),
  aiController.generateSynthesis
);
