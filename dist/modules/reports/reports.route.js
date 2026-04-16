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
 *   description: Gestion des signalements et incidents
 */
// ─── Public / Dynamic auth ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: "Créer un nouveau signalement"
 *     description: L'authentification peut être optionnelle selon la configuration SaaS (SystemSettings).
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, type]
 *             properties:
 *               title: { type: string, example: "Problème clim Salle 12" }
 *               content: { type: string, example: "La clim fait un bruit insupportable" }
 *               type: { type: string, enum: [PROBLEM_MATERIAL, PROBLEM_ADMIN, PROBLEM_PEDAGOGICAL, INCIDENT, SUGGESTION, OTHER] }
 *               isAnonymous: { type: boolean, default: false }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL], default: MEDIUM }
 *               classId: { type: string, format: uuid }
 *               professorId: { type: string, format: uuid }
 *               moduleId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Signalement créé. Déclenche automatiquement une analyse IA asynchrone.
 */
exports.reportsRouter.post('/', (0, dynamicAuth_middleware_1.dynamicAuthMiddleware)('reports'), (0, validate_middleware_1.validate)({ body: reports_schema_1.createReportSchema }), reports_controller_1.reportsController.create);
// ─── Protected routes ─────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: "Liste des signalements (Filtres & Pagination)"
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, SUBMITTED, REVIEWED, APPROVED, REJECTED] }
 *       - in: query
 *         name: campusId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: search
 *         description: Filtre texte sur titre ou contenu
 *         schema: { type: string }
 *       - in: query
 *         name: professorId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: moduleId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [PROBLEM_MATERIAL, PROBLEM_ADMIN, PROBLEM_PEDAGOGICAL, INCIDENT, SUGGESTION, OTHER] }
 *       - in: query
 *         name: isAnonymous
 *         schema: { type: boolean }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
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
exports.reportsRouter.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: reports_schema_1.reportQuerySchema }), reports_controller_1.reportsController.getAll);
/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: "Voir un signalement par ID"
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
 *         description: Détail complet avec analyse IA (si terminée)
 */
exports.reportsRouter.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema }), reports_controller_1.reportsController.getById);
/**
 * @swagger
 * /api/reports/{id}:
 *   patch:
 *     summary: "Modifier un signalement"
 *     description: Seul l'auteur ou un administrateur peut modifier le contenu d'un rapport non encore traité.
 *     tags: [Reports]
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
 *               content: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *     responses:
 *       200:
 *         description: Signalement mis à jour
 */
exports.reportsRouter.patch('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema, body: reports_schema_1.updateReportSchema }), reports_controller_1.reportsController.update);
/**
 * @swagger
 * /api/reports/{id}/status:
 *   patch:
 *     summary: "Changer le statut (MANAGER+)"
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
 *         description: Statut mis à jour avec succès
 */
exports.reportsRouter.patch('/:id/status', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema, body: reports_schema_1.updateReportStatusSchema }), reports_controller_1.reportsController.updateStatus);
/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: "Supprimer un signalement (ADMIN+)"
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
 *         description: Supprimé définitivement
 */
exports.reportsRouter.delete('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema }), reports_controller_1.reportsController.remove);
/**
 * @swagger
 * /api/reports/{id}/analyze:
 *   post:
 *     summary: "Déclencher une analyse IA forcée"
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
 *         description: Analyse ajoutée à la file Redis. Le résultat sera stocké dans aiAnalysis.
 */
exports.reportsRouter.post('/:id/analyze', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema }), reports_controller_1.reportsController.analyze);
//# sourceMappingURL=reports.route.js.map