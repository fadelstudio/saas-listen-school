"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const reports_controller_1 = require("./reports.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const optionalAuth_middleware_1 = require("../../core/middleware/optionalAuth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const reports_schema_1 = require("./reports.schema");
exports.reportsRouter = (0, express_1.Router)();
// ─── Public / optional auth ───────────────────────────────────────────────────
/** POST /api/reports — anonymous or authenticated */
exports.reportsRouter.post('/', optionalAuth_middleware_1.optionalAuthMiddleware, (0, validate_middleware_1.validate)({ body: reports_schema_1.createReportSchema }), reports_controller_1.reportsController.create);
// ─── Protected routes ─────────────────────────────────────────────────────────
/** GET /api/reports */
exports.reportsRouter.get('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: reports_schema_1.reportQuerySchema }), reports_controller_1.reportsController.getAll);
/** GET /api/reports/:id */
exports.reportsRouter.get('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema }), reports_controller_1.reportsController.getById);
/** PATCH /api/reports/:id */
exports.reportsRouter.patch('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema, body: reports_schema_1.updateReportSchema }), reports_controller_1.reportsController.update);
/** PATCH /api/reports/:id/status */
exports.reportsRouter.patch('/:id/status', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema, body: reports_schema_1.updateReportStatusSchema }), reports_controller_1.reportsController.updateStatus);
/** DELETE /api/reports/:id */
exports.reportsRouter.delete('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema }), reports_controller_1.reportsController.remove);
/** POST /api/reports/:id/analyze */
exports.reportsRouter.post('/:id/analyze', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: reports_schema_1.reportParamsSchema }), reports_controller_1.reportsController.analyze);
//# sourceMappingURL=reports.route.js.map