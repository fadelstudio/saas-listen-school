import { Router } from 'express';
import { evaluationsController } from './evaluations.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { dynamicAuthMiddleware } from '../../core/middleware/dynamicAuth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createEvaluationSchema,
  updateEvaluationSchema,
  evaluationParamsSchema,
  evaluationQuerySchema,
} from './evaluations.schema';

export const evaluationsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Evaluations
 *   description: Évaluations pédagogiques des professeurs et modules par les étudiants
 */

/**
 * @swagger
 * /api/evaluations:
 *   post:
 *     summary: "Soumettre une évaluation"
 *     tags: [Evaluations]
 *     description: Authentification optionnelle (selon config SaaS). Permet de noter la performance d'un professeur sur un module spécifique.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [professorId, moduleId, classId, score]
 *             properties:
 *               professorId: { type: string, format: uuid, example: "uuid-prof" }
 *               moduleId: { type: string, format: uuid, example: "uuid-module" }
 *               classId: { type: string, format: uuid, example: "uuid-class" }
 *               score: { type: number, minimum: 0, maximum: 20, example: 17.5, description: "Note sur 20" }
 *               comment: { type: string, example: "Excellent cours, très clair." }
 *               isAnonymous: { type: boolean, default: false }
 *     responses:
 *       201:
 *         description: Évaluation enregistrée. Une analyse IA de sentiment peut être déclenchée.
 */
evaluationsRouter.post(
  '/',
  dynamicAuthMiddleware('evaluations'),
  validate({ body: createEvaluationSchema }),
  evaluationsController.create
);

/**
 * @swagger
 * /api/evaluations/stats:
 *   get:
 *     summary: "Obtenir les statistiques agrégées (Moyennes)"
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques par professeur et module (moyennes, nb évaluations)
 */
evaluationsRouter.get('/stats', authMiddleware, evaluationsController.getStats);

/**
 * @swagger
 * /api/evaluations:
 *   get:
 *     summary: "Liste des évaluations (ADMIN+)"
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: professorId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: moduleId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED] }
 *       - in: query
 *         name: evaluatorId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: reportId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste paginée d'évaluations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { type: object } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
evaluationsRouter.get(
  '/',
  authMiddleware,
  validate({ query: evaluationQuerySchema }),
  evaluationsController.getAll
);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   get:
 *     summary: "Voir une évaluation détaillée"
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail complet de l'évaluation
 */
evaluationsRouter.get(
  '/:id',
  authMiddleware,
  validate({ params: evaluationParamsSchema }),
  evaluationsController.getById
);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   patch:
 *     summary: "Modifier une évaluation"
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score: { type: number, minimum: 0, maximum: 20 }
 *               comment: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Mise à jour réussie
 */
evaluationsRouter.patch(
  '/:id',
  authMiddleware,
  validate({ params: evaluationParamsSchema, body: updateEvaluationSchema }),
  evaluationsController.update
);

/**
 * @swagger
 * /api/evaluations/{id}:
 *   delete:
 *     summary: "Supprimer une évaluation (ADMIN+)"
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Supprimée définitivement
 */
evaluationsRouter.delete(
  '/:id',
  authMiddleware,
  validate({ params: evaluationParamsSchema }),
  evaluationsController.remove
);

/**
 * @swagger
 * /api/evaluations/{id}/analyze:
 *   post:
 *     summary: "Forcer la notation IA (Scoring de sentiment)"
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Job de notation IA en file d'attente.
 */
evaluationsRouter.post(
  '/:id/analyze',
  authMiddleware,
  validate({ params: evaluationParamsSchema }),
  evaluationsController.analyze
);
