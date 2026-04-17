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
 *             required: [professorId, moduleId, classId, comprehensionRating, explanationRating, pedagogyRating, availabilityRating, rhythmRating]
 *             properties:
 *               professorId: { type: string, format: uuid, example: "uuid-prof" }
 *               moduleId: { type: string, format: uuid, example: "uuid-module" }
 *               classId: { type: string, format: uuid, example: "uuid-class" }
 *               comprehensionRating: { type: string, enum: [VERY_POOR, POOR, FAIR, GOOD, EXCELLENT] }
 *               explanationRating: { type: string, enum: [VERY_POOR, POOR, FAIR, GOOD, EXCELLENT] }
 *               pedagogyRating: { type: string, enum: [VERY_POOR, POOR, FAIR, GOOD, EXCELLENT] }
 *               availabilityRating: { type: string, enum: [VERY_POOR, POOR, FAIR, GOOD, EXCELLENT] }
 *               rhythmRating: { type: string, enum: [VERY_POOR, POOR, FAIR, GOOD, EXCELLENT] }
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
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
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
 *               comprehensionRating: { type: string, enum: [VERY_POOR, POOR, FAIR, GOOD, EXCELLENT] }
 *               explanationRating: { type: string, enum: [VERY_POOR, POOR, FAIR, GOOD, EXCELLENT] }
 *               pedagogyRating: { type: string, enum: [VERY_POOR, POOR, FAIR, GOOD, EXCELLENT] }
 *               availabilityRating: { type: string, enum: [VERY_POOR, POOR, FAIR, GOOD, EXCELLENT] }
 *               rhythmRating: { type: string, enum: [VERY_POOR, POOR, FAIR, GOOD, EXCELLENT] }
 *               comment: { type: string }
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
