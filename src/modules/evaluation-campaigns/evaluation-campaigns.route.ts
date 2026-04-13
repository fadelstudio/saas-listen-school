import { Router } from 'express';
import { evaluationCampaignsController } from './evaluation-campaigns.controller';
import { authMiddleware, requireRole } from '../../core/middleware/auth.middleware';
import { Role } from '@prisma/client';
import { validate } from '../../core/middleware/validate.middleware';
import {
  createEvaluationCampaignSchema,
  evaluationCampaignIdParamsSchema,
  evaluationCampaignQuerySchema,
} from './evaluation-campaigns.schema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Evaluation Campaigns
 *   description: Administration des appels à l'évaluation
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/evaluation-campaigns:
 *   post:
 *     summary: Créer une campagne d'évaluation (Admin)
 *     tags: [Evaluation Campaigns]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, classId, moduleId, professorId]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               classId: { type: string, format: uuid }
 *               moduleId: { type: string, format: uuid }
 *               professorId: { type: string, format: uuid }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Campagne créée
 */
router.post(
  '/',
  requireRole(Role.ADMIN),
  validate({ body: createEvaluationCampaignSchema }),
  evaluationCampaignsController.create
);

/**
 * @swagger
 * /api/evaluation-campaigns:
 *   get:
 *     summary: Liste des campagnes
 *     tags: [Evaluation Campaigns]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée
 */
router.get('/', validate({ query: evaluationCampaignQuerySchema }), evaluationCampaignsController.getAll);

/**
 * @swagger
 * /api/evaluation-campaigns/{id}:
 *   get:
 *     summary: Détails d'une campagne
 *     tags: [Evaluation Campaigns]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détails
 */
router.get('/:id', validate({ params: evaluationCampaignIdParamsSchema }), evaluationCampaignsController.getById);

/**
 * @swagger
 * /api/evaluation-campaigns/{id}/close:
 *   post:
 *     summary: Clôturer une campagne
 *     tags: [Evaluation Campaigns]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Campagne clôturée
 */
router.post(
  '/:id/close',
  requireRole(Role.ADMIN),
  validate({ params: evaluationCampaignIdParamsSchema }),
  evaluationCampaignsController.close
);

export { router as evaluationCampaignsRouter };
