"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const ai_controller_1 = require("./ai.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const ai_schema_1 = require("./ai.schema");
exports.aiRouter = (0, express_1.Router)();
/** GET /api/ai/jobs */
exports.aiRouter.get('/jobs', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ query: ai_schema_1.aiJobQuerySchema }), ai_controller_1.aiController.getJobs);
/** GET /api/ai/jobs/:jobId */
exports.aiRouter.get('/jobs/:jobId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: ai_schema_1.aiJobParamsSchema }), ai_controller_1.aiController.getJobById);
/** GET /api/ai/jobs/:jobId/result */
exports.aiRouter.get('/jobs/:jobId/result', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: ai_schema_1.aiJobParamsSchema }), ai_controller_1.aiController.getJobResult);
/** POST /api/ai/jobs/:jobId/retry */
exports.aiRouter.post('/jobs/:jobId/retry', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ params: ai_schema_1.aiJobParamsSchema }), ai_controller_1.aiController.retryJob);
/** POST /api/ai/chat */
exports.aiRouter.post('/chat', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: ai_schema_1.chatSchema }), ai_controller_1.aiController.chat);
/** POST /api/ai/synthesis */
exports.aiRouter.post('/synthesis', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: ai_schema_1.synthesisSchema }), ai_controller_1.aiController.generateSynthesis);
//# sourceMappingURL=ai.route.js.map