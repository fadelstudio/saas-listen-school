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
 *   description: Décisions administratives, plans d'action et résolutions d'incidents
 */

/**
 * @swagger
 * /api/decisions:
 *   post:
 *     summary: "Créer une décision ou un plan d'action (MANAGER+)"
 *     description: Crée une mesure corrective suite à un signalement ou une évaluation.
 *     tags: [Decisions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [evaluationId, title]
 *             properties:
 *               evaluationId: { type: string, format: uuid, description: "ID de l'évaluation liée (requis)" }
 *               title: { type: string, example: "Réparation climatisation" }
 *               rationale: { type: string, example: "Suite aux nombreux signalements sur la chaleur en salle 12." }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL], default: MEDIUM }
 *               responsible: { type: string, example: "Service technique" }
 *               dueDate: { type: string, format: date-time, example: "2026-05-01T10:00:00Z" }
 *     responses:
 *       201:
 *         description: Décision créée avec succès
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
 *     summary: "Liste des décisions et plans d'actions"
 *     tags: [Decisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PROPOSED, APPROVED, REJECTED, IN_PROGRESS, DONE] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *       - in: query
 *         name: deciderId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste paginée récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { type: object } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
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
 *     summary: "Voir le détail d'une décision"
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
 *         description: Détail complet de la décision
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
 *     summary: "Modifier une décision existante"
 *     tags: [Decisions]
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
 *               title: { type: string }
 *               rationale: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *               responsible: { type: string }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Modifications enregistrées
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
 *     summary: "Mettre à jour l'avancement d'une décision"
 *     description: Permet de passer de PENDING à DONE une fois l'action réalisée.
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
 *               status: { type: string, enum: [PROPOSED, APPROVED, REJECTED, IN_PROGRESS, DONE] }
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
 *     summary: "Supprimer une décision (ADMIN+)"
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
 *         description: Action supprimée.
 */
decisionsRouter.delete(
  '/:id',
  authMiddleware,
  validate({ params: decisionParamsSchema }),
  decisionsController.remove
);
