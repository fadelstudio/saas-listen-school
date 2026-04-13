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
 *   description: Administration des appels à l'évaluation
 */
router.use(auth_middleware_1.authMiddleware);
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
 *             required: [title, moduleId, professorId, dueDate]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               scope:
 *                 type: string
 *                 enum: [CLASS, CAMPUS, SCHOOL]
 *                 default: CLASS
 *               classId: { type: string, format: uuid, nullable: true }
 *               campusId: { type: string, format: uuid, nullable: true }
 *               moduleId: { type: string, format: uuid }
 *               professorId: { type: string, format: uuid }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Campagne créée
 */
router.post('/', (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ body: evaluation_campaigns_schema_1.createEvaluationCampaignSchema }), evaluation_campaigns_controller_1.evaluationCampaignsController.create);
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
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée
 */
router.get('/', (0, validate_middleware_1.validate)({ query: evaluation_campaigns_schema_1.evaluationCampaignQuerySchema }), evaluation_campaigns_controller_1.evaluationCampaignsController.getAll);
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
router.get('/:id', (0, validate_middleware_1.validate)({ params: evaluation_campaigns_schema_1.evaluationCampaignIdParamsSchema }), evaluation_campaigns_controller_1.evaluationCampaignsController.getById);
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
router.post('/:id/close', (0, auth_middleware_1.requireRole)(client_1.Role.ADMIN), (0, validate_middleware_1.validate)({ params: evaluation_campaigns_schema_1.evaluationCampaignIdParamsSchema }), evaluation_campaigns_controller_1.evaluationCampaignsController.close);
//# sourceMappingURL=evaluation-campaigns.route.js.map