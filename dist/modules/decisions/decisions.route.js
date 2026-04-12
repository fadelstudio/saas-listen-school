"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decisionsRouter = void 0;
const express_1 = require("express");
const decisions_controller_1 = require("./decisions.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const decisions_schema_1 = require("./decisions.schema");
exports.decisionsRouter = (0, express_1.Router)();
/** POST /api/decisions */
exports.decisionsRouter.post('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: decisions_schema_1.createDecisionSchema }), decisions_controller_1.decisionsController.create);
/** GET /api/decisions */
exports.decisionsRouter.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: decisions_schema_1.decisionQuerySchema }), decisions_controller_1.decisionsController.getAll);
/** GET /api/decisions/:id */
exports.decisionsRouter.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: decisions_schema_1.decisionParamsSchema }), decisions_controller_1.decisionsController.getById);
/** PATCH /api/decisions/:id */
exports.decisionsRouter.patch('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: decisions_schema_1.decisionParamsSchema, body: decisions_schema_1.updateDecisionSchema }), decisions_controller_1.decisionsController.update);
/** PATCH /api/decisions/:id/status */
exports.decisionsRouter.patch('/:id/status', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: decisions_schema_1.decisionParamsSchema, body: decisions_schema_1.updateDecisionStatusSchema }), decisions_controller_1.decisionsController.updateStatus);
/** DELETE /api/decisions/:id */
exports.decisionsRouter.delete('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: decisions_schema_1.decisionParamsSchema }), decisions_controller_1.decisionsController.remove);
//# sourceMappingURL=decisions.route.js.map