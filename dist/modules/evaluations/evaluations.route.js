"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluationsRouter = void 0;
const express_1 = require("express");
const evaluations_controller_1 = require("./evaluations.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const optionalAuth_middleware_1 = require("../../core/middleware/optionalAuth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const evaluations_schema_1 = require("./evaluations.schema");
exports.evaluationsRouter = (0, express_1.Router)();
/** POST /api/evaluations */
exports.evaluationsRouter.post('/', optionalAuth_middleware_1.optionalAuthMiddleware, (0, validate_middleware_1.validate)({ body: evaluations_schema_1.createEvaluationSchema }), evaluations_controller_1.evaluationsController.create);
/** GET /api/evaluations/stats */
exports.evaluationsRouter.get('/stats', auth_middleware_1.authMiddleware, evaluations_controller_1.evaluationsController.getStats);
/** GET /api/evaluations */
exports.evaluationsRouter.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: evaluations_schema_1.evaluationQuerySchema }), evaluations_controller_1.evaluationsController.getAll);
/** GET /api/evaluations/:id */
exports.evaluationsRouter.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: evaluations_schema_1.evaluationParamsSchema }), evaluations_controller_1.evaluationsController.getById);
/** PATCH /api/evaluations/:id */
exports.evaluationsRouter.patch('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: evaluations_schema_1.evaluationParamsSchema, body: evaluations_schema_1.updateEvaluationSchema }), evaluations_controller_1.evaluationsController.update);
/** DELETE /api/evaluations/:id */
exports.evaluationsRouter.delete('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: evaluations_schema_1.evaluationParamsSchema }), evaluations_controller_1.evaluationsController.remove);
/** POST /api/evaluations/:id/analyze */
exports.evaluationsRouter.post('/:id/analyze', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: evaluations_schema_1.evaluationParamsSchema }), evaluations_controller_1.evaluationsController.analyze);
//# sourceMappingURL=evaluations.route.js.map