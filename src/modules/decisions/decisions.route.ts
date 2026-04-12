import { Router } from 'express';
import { decisionsController } from './decisions.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createDecisionSchema,
  updateDecisionSchema,
  updateDecisionStatusSchema,
  decisionParamsSchema,
  decisionQuerySchema,
} from './decisions.schema';

export const decisionsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Decisions
 *   description: Décisions administratives et résolutions
 */

/**
 * @swagger
 * /api/decisions:
 *   post:
 *     summary: Créer une décision (Manager+)
 *     tags: [Decisions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reportId, title, content]
 *             properties:
 *               reportId: { type: string, format: uuid }
 *               title: { type: string }
 *               content: { type: string }
 *               responsible: { type: string }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Décision créée
 */
decisionsRouter.post(
  '/',
  authMiddleware,
  validate({ body: createDecisionSchema }),
  decisionsController.create
);

/**
 * @swagger
 * /api/decisions:
 *   get:
 *     summary: Liste des décisions
 *     tags: [Decisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED] }
 *     responses:
 *       200:
 *         description: Liste paginée
 */
decisionsRouter.get(
  '/',
  authMiddleware,
  validate({ query: decisionQuerySchema }),
  decisionsController.getAll
);

/**
 * @swagger
 * /api/decisions/{id}:
 *   get:
 *     summary: Voir une décision par ID
 *     tags: [Decisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail
 */
decisionsRouter.get(
  '/:id',
  authMiddleware,
  validate({ params: decisionParamsSchema }),
  decisionsController.getById
);

/**
 * @swagger
 * /api/decisions/{id}:
 *   patch:
 *     summary: Modifier une décision
 *     tags: [Decisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Mis à jour
 */
decisionsRouter.patch(
  '/:id',
  authMiddleware,
  validate({ params: decisionParamsSchema, body: updateDecisionSchema }),
  decisionsController.update
);

/**
 * @swagger
 * /api/decisions/{id}/status:
 *   patch:
 *     summary: Changer le statut (Manager+)
 *     tags: [Decisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED] }
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
decisionsRouter.patch(
  '/:id/status',
  authMiddleware,
  validate({ params: decisionParamsSchema, body: updateDecisionStatusSchema }),
  decisionsController.updateStatus
);

/**
 * @swagger
 * /api/decisions/{id}:
 *   delete:
 *     summary: Supprimer une décision (Admin)
 *     tags: [Decisions]
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
decisionsRouter.delete(
  '/:id',
  authMiddleware,
  validate({ params: decisionParamsSchema }),
  decisionsController.remove
);
