"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationCampaignsRouter = void 0;
const express_1 = require("express");
const evaluation_campaigns_controller_1 = require("./evaluation-campaigns.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const client_1 = require("@prisma/client");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const evaluation_campaigns_schema_1 = require("./evaluation-campaigns.schema");
const router = (0, express_1.Router)();
exports.evaluationCampaignsRouter = router;
/**
 * @swagger
 * tags:
 *   name: Evaluation Campaigns
 *   description: Administration des appels à l'évaluation (Campagnes éphémères ou périodiques)
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * @swagger
 * /api/evaluation-campaigns:
 *   post:
 *     summary: "Lancer une nouvelle campagne d'évaluation (MANAGER+)"
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
router.post('/', (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ body: evaluation_campaigns_schema_1.createEvaluationCampaignSchema }), evaluation_campaigns_controller_1.evaluationCampaignsController.create);
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
router.get('/', (0, validate_middleware_1.validate)({ query: evaluation_campaigns_schema_1.evaluationCampaignQuerySchema }), evaluation_campaigns_controller_1.evaluationCampaignsController.getAll);
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
router.get('/:id', (0, validate_middleware_1.validate)({ params: evaluation_campaigns_schema_1.evaluationCampaignIdParamsSchema }), evaluation_campaigns_controller_1.evaluationCampaignsController.getById);
/**
 * @swagger
 * /api/evaluation-campaigns/{id}/close:
 *   post:
 *     summary: "Clôturer manuellement une campagne (MANAGER+)"
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
router.post('/:id/close', (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ params: evaluation_campaigns_schema_1.evaluationCampaignIdParamsSchema }), evaluation_campaigns_controller_1.evaluationCampaignsController.close);
router.get('/:id/analytics', (0, validate_middleware_1.validate)({ params: evaluation_campaigns_schema_1.evaluationCampaignIdParamsSchema }), evaluation_campaigns_controller_1.evaluationCampaignsController.getAnalytics);
router.post('/:id/remind', (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ params: evaluation_campaigns_schema_1.evaluationCampaignIdParamsSchema }), evaluation_campaigns_controller_1.evaluationCampaignsController.remind);
router.post('/:id/analyze', (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.MANAGER), (0, validate_middleware_1.validate)({ params: evaluation_campaigns_schema_1.evaluationCampaignIdParamsSchema }), evaluation_campaigns_controller_1.evaluationCampaignsController.analyze);
//# sourceMappingURL=evaluation-campaigns.route.js.map