"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../core/middleware/auth.middleware");
const validate_middleware_1 = require("../../core/middleware/validate.middleware");
const auth_schema_1 = require("./auth.schema");
exports.authRouter = (0, express_1.Router)();
// ─── Public routes ────────────────────────────────────────────────────────────
/** POST /api/auth/register */
exports.authRouter.post('/register', (0, validate_middleware_1.validate)({ body: auth_schema_1.registerSchema }), auth_controller_1.authController.register);
/** POST /api/auth/login */
exports.authRouter.post('/login', (0, validate_middleware_1.validate)({ body: auth_schema_1.loginSchema }), auth_controller_1.authController.login);
// ─── Protected routes ─────────────────────────────────────────────────────────
/** GET /api/auth/me */
exports.authRouter.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.authController.me);
/** PATCH /api/auth/me */
exports.authRouter.patch('/me', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: auth_schema_1.updateProfileSchema }), auth_controller_1.authController.updateProfile);
/** POST /api/auth/change-password */
exports.authRouter.post('/change-password', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)({ body: auth_schema_1.changePasswordSchema }), auth_controller_1.authController.changePassword);
//# sourceMappingURL=auth.route.js.map