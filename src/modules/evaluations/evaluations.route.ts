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
 *   description: Évaluations pédagogiques des professeurs et modules
 */

/**
 * @swagger
 * /api/evaluations:
 *   post:
 *     summary: Soumettre une évaluation
 *     tags: [Evaluations]
 *     description: Authentification optionnelle. Permet de noter un prof/module.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [professorId, moduleId, classId, score]
 *             properties:
 *               professorId: { type: string, format: uuid }
 *               moduleId: { type: string, format: uuid }
 *               classId: { type: string, format: uuid }
 *               score: { type: number, minimum: 0, maximum: 20 }
 *               comment: { type: string }
 *               isAnonymous: { type: boolean, default: false }
 *     responses:
 *       201:
 *         description: Évaluation créée
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
 *     summary: Obtenir les statistiques agrégées (Moyennes)
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques par professeur et module
 */
evaluationsRouter.get('/stats', authMiddleware, evaluationsController.getStats);

/**
 * @swagger
 * /api/evaluations:
 *   get:
 *     summary: Liste des évaluations
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: professorId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Liste paginée
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
 *     summary: Voir une évaluation par ID
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
 *         description: Détail de l'évaluation
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
 *     summary: Modifier une évaluation
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
 *         description: Évaluation mise à jour
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
 *     summary: Supprimer une évaluation (Admin uniquement)
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
 *         description: Supprimé
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
 *     summary: Déclencher une notation IA forcée
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
 *         description: Job de notation IA enqueué
 */
evaluationsRouter.post(
  '/:id/analyze',
  authMiddleware,
  validate({ params: evaluationParamsSchema }),
  evaluationsController.analyze
);
