"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationsRouter = void 0;
const express_1 = require("express");
const evaluations_controller_1 = require("./evaluations.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const dynamicAuth_middleware_1 = require("../../core/middleware/dynamicAuth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const evaluations_schema_1 = require("./evaluations.schema");
exports.evaluationsRouter = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Evaluations
 *   description: Évaluations pédagogiques des professeurs et modules par les étudiants
 */
/**
 * @swagger
 * /api/evaluations:
 *   post:
 *     summary: "Soumettre une évaluation"
 *     tags: [Evaluations]
 *     description: Authentification optionnelle (selon config SaaS). Permet de noter la performance d'un professeur sur un module spécifique.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [professorId, moduleId, classId, score]
 *             properties:
 *               professorId: { type: string, format: uuid, example: "uuid-prof" }
 *               moduleId: { type: string, format: uuid, example: "uuid-module" }
 *               classId: { type: string, format: uuid, example: "uuid-class" }
 *               score: { type: number, minimum: 0, maximum: 20, example: 17.5, description: "Note sur 20" }
 *               comment: { type: string, example: "Excellent cours, très clair." }
 *               isAnonymous: { type: boolean, default: false }
 *     responses:
 *       201:
 *         description: Évaluation enregistrée. Une analyse IA de sentiment peut être déclenchée.
 */
exports.evaluationsRouter.post('/', (0, dynamicAuth_middleware_1.dynamicAuthMiddleware)('evaluations'), (0, validate_middleware_1.validate)({ body: evaluations_schema_1.createEvaluationSchema }), evaluations_controller_1.evaluationsController.create);
/**
 * @swagger
 * /api/evaluations/stats:
 *   get:
 *     summary: "Obtenir les statistiques agrégées (Moyennes)"
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques par professeur et module (moyennes, nb évaluations)
 */
exports.evaluationsRouter.get('/stats', auth_middleware_1.authMiddleware, evaluations_controller_1.evaluationsController.getStats);
/**
 * @swagger
 * /api/evaluations:
 *   get:
 *     summary: "Liste des évaluations (ADMIN+)"
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: professorId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: moduleId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: classId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED] }
 *       - in: query
 *         name: evaluatorId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: reportId
 *         schema: { type: string, format: uuid }
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
 *         description: Liste paginée d'évaluations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { type: object } }
 *                 meta: { $ref: '#/components/schemas/PaginationMeta' }
 */
exports.evaluationsRouter.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: evaluations_schema_1.evaluationQuerySchema }), evaluations_controller_1.evaluationsController.getAll);
/**
 * @swagger
 * /api/evaluations/{id}:
 *   get:
 *     summary: "Voir une évaluation détaillée"
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
 *         description: Détail complet de l'évaluation
 */
exports.evaluationsRouter.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: evaluations_schema_1.evaluationParamsSchema }), evaluations_controller_1.evaluationsController.getById);
/**
 * @swagger
 * /api/evaluations/{id}:
 *   patch:
 *     summary: "Modifier une évaluation"
 *     tags: [Evaluations]
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
 *               score: { type: number, minimum: 0, maximum: 20 }
 *               comment: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Mise à jour réussie
 */
exports.evaluationsRouter.patch('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: evaluations_schema_1.evaluationParamsSchema, body: evaluations_schema_1.updateEvaluationSchema }), evaluations_controller_1.evaluationsController.update);
/**
 * @swagger
 * /api/evaluations/{id}:
 *   delete:
 *     summary: "Supprimer une évaluation (ADMIN+)"
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
 *         description: Supprimée définitivement
 */
exports.evaluationsRouter.delete('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: evaluations_schema_1.evaluationParamsSchema }), evaluations_controller_1.evaluationsController.remove);
/**
 * @swagger
 * /api/evaluations/{id}/analyze:
 *   post:
 *     summary: "Forcer la notation IA (Scoring de sentiment)"
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
 *         description: Job de notation IA en file d'attente.
 */
exports.evaluationsRouter.post('/:id/analyze', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: evaluations_schema_1.evaluationParamsSchema }), evaluations_controller_1.evaluationsController.analyze);
//# sourceMappingURL=evaluations.route.js.map