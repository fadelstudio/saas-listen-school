"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
/**
 * Optional auth middleware.
 * If a valid Bearer token is present → injects req.user.
 * If no token or invalid → continues without req.user (does NOT block).
 * Use on routes that support both authenticated and anonymous submissions.
 */
function optionalAuthMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(); // anonymous — continue without user
    }
    const token = authHeader.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = payload;
    }
    catch {
        // Invalid token — treat as anonymous, do not reject
    }
    next();
}
//# sourceMappingURL=optionalAuth.middleware.js.map