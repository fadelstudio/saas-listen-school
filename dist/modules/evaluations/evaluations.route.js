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
 *   description: Évaluations pédagogiques des professeurs et modules
 */
/**
 * @swagger
 * /api/evaluations:
 *   post:
 *     summary: Soumettre une évaluation
 *     tags: [Evaluations]
 *     description: Authentification optionnelle. Permet de noter un prof/module.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [professorId, moduleId, classId, score]
 *             properties:
 *               professorId: { type: string, format: uuid }
 *               moduleId: { type: string, format: uuid }
 *               classId: { type: string, format: uuid }
 *               score: { type: number, minimum: 0, maximum: 20 }
 *               comment: { type: string }
 *               isAnonymous: { type: boolean, default: false }
 *     responses:
 *       201:
 *         description: Évaluation créée
 */
exports.evaluationsRouter.post('/', (0, dynamicAuth_middleware_1.dynamicAuthMiddleware)('evaluations'), (0, validate_middleware_1.validate)({ body: evaluations_schema_1.createEvaluationSchema }), evaluations_controller_1.evaluationsController.create);
/**
 * @swagger
 * /api/evaluations/stats:
 *   get:
 *     summary: Obtenir les statistiques agrégées (Moyennes)
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques par professeur et module
 */
exports.evaluationsRouter.get('/stats', auth_middleware_1.authMiddleware, evaluations_controller_1.evaluationsController.getStats);
/**
 * @swagger
 * /api/evaluations:
 *   get:
 *     summary: Liste des évaluations
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: professorId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Liste paginée
 */
exports.evaluationsRouter.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: evaluations_schema_1.evaluationQuerySchema }), evaluations_controller_1.evaluationsController.getAll);
/**
 * @swagger
 * /api/evaluations/{id}:
 *   get:
 *     summary: Voir une évaluation par ID
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
 *         description: Détail de l'évaluation
 */
exports.evaluationsRouter.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: evaluations_schema_1.evaluationParamsSchema }), evaluations_controller_1.evaluationsController.getById);
/**
 * @swagger
 * /api/evaluations/{id}:
 *   patch:
 *     summary: Modifier une évaluation
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
 *         description: Évaluation mise à jour
 */
exports.evaluationsRouter.patch('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: evaluations_schema_1.evaluationParamsSchema, body: evaluations_schema_1.updateEvaluationSchema }), evaluations_controller_1.evaluationsController.update);
/**
 * @swagger
 * /api/evaluations/{id}:
 *   delete:
 *     summary: Supprimer une évaluation (Admin uniquement)
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
 *         description: Supprimé
 */
exports.evaluationsRouter.delete('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: evaluations_schema_1.evaluationParamsSchema }), evaluations_controller_1.evaluationsController.remove);
/**
 * @swagger
 * /api/evaluations/{id}/analyze:
 *   post:
 *     summary: Déclencher une notation IA forcée
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
 *         description: Job de notation IA enqueué
 */
exports.evaluationsRouter.post('/:id/analyze', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: evaluations_schema_1.evaluationParamsSchema }), evaluations_controller_1.evaluationsController.analyze);
//# sourceMappingURL=evaluations.route.js.map