"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionsRouter = void 0;
const express_1 = require("express");
const decisions_controller_1 = require("./decisions.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const decisions_schema_1 = require("./decisions.schema");
exports.decisionsRouter = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Decisions
 *   description: Décisions administratives et résolutions
 */
/**
 * @swagger
 * /api/decisions:
 *   post:
 *     summary: Créer une décision (Manager+)
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
 *               evaluationId: { type: string, format: uuid }
 *               title: { type: string }
 *               rationale: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *               responsible: { type: string }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Décision créée
 */
exports.decisionsRouter.post('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: decisions_schema_1.createDecisionSchema }), decisions_controller_1.decisionsController.create);
/**
 * @swagger
 * /api/decisions:
 *   get:
 *     summary: Liste des décisions
 *     tags: [Decisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED, DEFERRED, DONE] }
 *     responses:
 *       200:
 *         description: Liste paginée
 */
exports.decisionsRouter.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: decisions_schema_1.decisionQuerySchema }), decisions_controller_1.decisionsController.getAll);
/**
 * @swagger
 * /api/decisions/{id}:
 *   get:
 *     summary: Voir une décision par ID
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
 *         description: Détail
 */
exports.decisionsRouter.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: decisions_schema_1.decisionParamsSchema }), decisions_controller_1.decisionsController.getById);
/**
 * @swagger
 * /api/decisions/{id}:
 *   patch:
 *     summary: Modifier une décision
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
 *         description: Mis à jour
 */
exports.decisionsRouter.patch('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: decisions_schema_1.decisionParamsSchema, body: decisions_schema_1.updateDecisionSchema }), decisions_controller_1.decisionsController.update);
/**
 * @swagger
 * /api/decisions/{id}/status:
 *   patch:
 *     summary: Changer le statut (Manager+)
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
 *               status: { type: string, enum: [PENDING, APPROVED, REJECTED, DEFERRED, DONE] }
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
exports.decisionsRouter.patch('/:id/status', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: decisions_schema_1.decisionParamsSchema, body: decisions_schema_1.updateDecisionStatusSchema }), decisions_controller_1.decisionsController.updateStatus);
/**
 * @swagger
 * /api/decisions/{id}:
 *   delete:
 *     summary: Supprimer une décision (Admin)
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
 *         description: Supprimé
 */
exports.decisionsRouter.delete('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: decisions_schema_1.decisionParamsSchema }), decisions_controller_1.decisionsController.remove);
//# sourceMappingURL=decisions.route.js.map