"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const reports_controller_1 = require("./reports.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const dynamicAuth_middleware_1 = require("../../core/middleware/dynamicAuth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const reports_schema_1 = require("./reports.schema");
exports.reportsRouter = (0, express_1.Router)();
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
exports.reportsRouter.post('/', (0, dynamicAuth_middleware_1.dynamicAuthMiddleware)('reports'), (0, validate_middleware_1.validate)({ body: reports_schema_1.createReportSchema }), reports_controller_1.reportsController.create);
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
exports.reportsRouter.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: reports_schema_1.reportQuerySchema }), reports_controller_1.reportsController.getAll);
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
exports.reportsRouter.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema }), reports_controller_1.reportsController.getById);
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
exports.reportsRouter.patch('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema, body: reports_schema_1.updateReportSchema }), reports_controller_1.reportsController.update);
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
exports.reportsRouter.patch('/:id/status', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema, body: reports_schema_1.updateReportStatusSchema }), reports_controller_1.reportsController.updateStatus);
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
exports.reportsRouter.delete('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema }), reports_controller_1.reportsController.remove);
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
exports.reportsRouter.post('/:id/analyze', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema }), reports_controller_1.reportsController.analyze);
//# sourceMappingURL=reports.route.js.map