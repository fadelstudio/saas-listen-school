"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicAuthMiddleware = dynamicAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const system_service_1 = require("../../modules/system/system.service");
const AppError_1 = require("../errors/AppError");
/**
 * Dynamic Auth Middleware
 * Checks SystemSettings to decide if auth is mandatory or optional for a given type.
 */
function dynamicAuthMiddleware(type) {
    return async (req, _res, next) => {
        try {
            const schoolId = req.schoolId;
            if (!schoolId)
                throw new AppError_1.UnauthorizedError("School context missing");
            const settings = await system_service_1.systemService.getSettings(schoolId);
            const isRequired = (type === 'reports' && settings.authReportsRequired) ||
                (type === 'evaluations' && settings.authEvaluationsRequired);
            const authHeader = req.headers.authorization;
            // Case 1: No token provided
            if (!authHeader?.startsWith('Bearer ')) {
                if (isRequired) {
                    throw new AppError_1.UnauthorizedError(`Authentication required for ${type} submission`);
                }
                return next(); // Continue as anonymous
            }
            // Case 2: Token provided - try to verify
            const token = authHeader.slice(7);
            try {
                const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
                req.user = payload;
            }
            catch (error) {
                if (isRequired) {
                    throw new AppError_1.UnauthorizedError('Invalid or expired token');
                }
                // If optional and invalid token, just continue as anonymous
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=dynamicAuth.middleware.js.map