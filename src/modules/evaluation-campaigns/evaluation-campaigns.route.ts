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
 *   description: Administration des appels à l'évaluation (Campagnes éphémères ou périodiques)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/evaluation-campaigns:
 *   post:
 *     summary: "Lancer une nouvelle campagne d'évaluation (ADMIN+)"
 *     description: Crée une invitation à évaluer pour un groupe d'élèves (classe, campus ou école entière).
 *     tags: [Evaluation Campaigns]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, moduleId, professorId, dueDate]
 *             properties:
 *               title: { type: string, example: "Évaluation Semestrielle - Algorithmique" }
 *               description: { type: string, example: "Merci de noter le cours de M. Faye." }
 *               scope:
 *                 type: string
 *                 enum: [CLASS, CAMPUS, SCHOOL]
 *                 default: CLASS
 *                 description: "CLASS = Restreint à une classe, CAMPUS = Tout un campus, SCHOOL = Toute l'école"
 *               classId: { type: string, format: uuid, nullable: true }
 *               campusId: { type: string, format: uuid, nullable: true }
 *               moduleId: { type: string, format: uuid, description: "Module concerné" }
 *               professorId: { type: string, format: uuid, description: "Professeur concerné" }
 *               dueDate: { type: string, format: date-time, example: "2026-06-30T23:59:59Z" }
 *     responses:
 *       201:
 *         description: Campagne créée avec succès. Les élèves concernés recevront une notification.
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
 *     summary: "Liste de toutes les campagnes d'évaluations"
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
 *         name: scope
 *         schema: { type: string, enum: [CLASS, CAMPUS, SCHOOL] }
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [OPEN, CLOSED, EXPIRED] }
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
router.get('/', validate({ query: evaluationCampaignQuerySchema }), evaluationCampaignsController.getAll);

/**
 * @swagger
 * /api/evaluation-campaigns/{id}:
 *   get:
 *     summary: "Voir le détail d'une campagne"
 *     tags: [Evaluation Campaigns]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Fiche détaillée de la campagne (inclut statistiques de participation si dispo)
 */
router.get('/:id', validate({ params: evaluationCampaignIdParamsSchema }), evaluationCampaignsController.getById);

/**
 * @swagger
 * /api/evaluation-campaigns/{id}/close:
 *   post:
 *     summary: "Clôturer manuellement une campagne (ADMIN+)"
 *     description: Empêche toute nouvelle évaluation pour cette campagne.
 *     tags: [Evaluation Campaigns]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Campagne clôturée avec succès
 */
router.post(
  '/:id/close',
  requireRole(Role.ADMIN),
  validate({ params: evaluationCampaignIdParamsSchema }),
  evaluationCampaignsController.close
);

router.get(
  '/:id/analytics',
  validate({ params: evaluationCampaignIdParamsSchema }),
  evaluationCampaignsController.getAnalytics
);

router.post(
  '/:id/remind',
  requireRole(Role.ADMIN),
  validate({ params: evaluationCampaignIdParamsSchema }),
  evaluationCampaignsController.remind
);

router.post(
  '/:id/analyze',
  requireRole(Role.ADMIN),
  validate({ params: evaluationCampaignIdParamsSchema }),
  evaluationCampaignsController.analyze
);

export { router as evaluationCampaignsRouter };
