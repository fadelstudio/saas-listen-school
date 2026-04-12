import { Router } from 'express';
import { reportsController } from './reports.controller';
import { authMiddleware } from '../../core/middleware/auth.middleware';
import { dynamicAuthMiddleware } from '../../core/middleware/dynamicAuth.middleware';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createReportSchema,
  updateReportSchema,
  updateReportStatusSchema,
  reportParamsSchema,
  reportQuerySchema,
} from './reports.schema';

export const reportsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Gestion des signalements
 */

// ─── Public / Dynamic auth ────────────────────────────────────────────────────

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Créer un nouveau signalement
 *     description: L'authentification peut être optionnelle selon les réglages système.
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, type]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               type: { type: string, enum: [PROBLEM_MATERIAL, PROBLEM_ADMIN, PROBLEM_PEDAGOGICAL, INCIDENT, SUGGESTION, OTHER] }
 *               isAnonymous: { type: boolean, default: false }
 *               classId: { type: string, format: uuid }
 *               professorId: { type: string, format: uuid }
 *               moduleId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Signalement créé
 */
reportsRouter.post(
  '/',
  dynamicAuthMiddleware('reports'),
  validate({ body: createReportSchema }),
  reportsController.create
);

// ─── Protected routes ─────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Liste des signalements (Filtres & Pagination)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, SUBMITTED, REVIEWED, APPROVED, REJECTED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Liste paginée
 */
reportsRouter.get(
  '/',
  authMiddleware,
  validate({ query: reportQuerySchema }),
  reportsController.getAll
);

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Voir un signalement par ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail du signalement
 */
reportsRouter.get(
  '/:id',
  authMiddleware,
  validate({ params: reportParamsSchema }),
  reportsController.getById
);

/**
 * @swagger
 * /api/reports/{id}:
 *   patch:
 *     summary: Modifier un signalement (Auteur ou Admin)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Signalement mis à jour
 */
reportsRouter.patch(
  '/:id',
  authMiddleware,
  validate({ params: reportParamsSchema, body: updateReportSchema }),
  reportsController.update
);

/**
 * @swagger
 * /api/reports/{id}/status:
 *   patch:
 *     summary: Changer le statut (Admin/Manager uniquement)
 *     tags: [Reports]
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
 *               status: { type: string, enum: [SUBMITTED, REVIEWED, APPROVED, REJECTED] }
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
reportsRouter.patch(
  '/:id/status',
  authMiddleware,
  validate({ params: reportParamsSchema, body: updateReportStatusSchema }),
  reportsController.updateStatus
);

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Supprimer un signalement (Admin uniquement)
 *     tags: [Reports]
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
reportsRouter.delete(
  '/:id',
  authMiddleware,
  validate({ params: reportParamsSchema }),
  reportsController.remove
);

/**
 * @swagger
 * /api/reports/{id}/analyze:
 *   post:
 *     summary: Déclencher une analyse IA forcée
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Job IA ajouté à la file
 */
reportsRouter.post(
  '/:id/analyze',
  authMiddleware,
  validate({ params: reportParamsSchema }),
  reportsController.analyze
);
