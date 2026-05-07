"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
exports.authMiddleware = authMiddleware;
exports.requireRole = requireRole;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../errors/AppError");
const prisma_1 = require("../database/prisma");
async function authMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        throw new AppError_1.UnauthorizedError("Missing or malformed authorization header");
    }
    const token = authHeader.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Single Session Enforcement
        if (payload.sid) {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: payload.userId },
                select: { currentSessionId: true }
            });
            if (user && user.currentSessionId !== payload.sid) {
                throw new AppError_1.UnauthorizedError("Session expirée : une autre connexion a été détectée sur cet appareil.");
            }
        }
        if (payload.role !== "SUPERADMIN" && !payload.schoolId) {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: payload.userId },
                select: {
                    schoolId: true,
                    campuses: { select: { schoolId: true }, take: 1 },
                },
            });
            const resolvedSchoolId = user?.schoolId || user?.campuses?.[0]?.schoolId || null;
            if (!resolvedSchoolId) {
                throw new AppError_1.UnauthorizedError("Token missing school context. Please log in again.");
            }
            payload.schoolId = resolvedSchoolId;
        }
        if (payload.role !== "SUPERADMIN" &&
            req.schoolId &&
            payload.schoolId &&
            payload.schoolId !== req.schoolId) {
            throw new AppError_1.ForbiddenError("Token school does not match request school context");
        }
        req.user = payload;
        next();
    }
    catch (err) {
        if (err instanceof AppError_1.UnauthorizedError || err instanceof AppError_1.ForbiddenError)
            throw err;
        throw new AppError_1.UnauthorizedError("Invalid or expired token");
    }
}
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            throw new AppError_1.UnauthorizedError("Authentication required");
        }
        // SUPERADMIN can access everything
        if (req.user.role === 'SUPERADMIN') {
            return next();
        }
        if (!roles.includes(req.user.role)) {
            throw new AppError_1.ForbiddenError("Insufficient permissions");
        }
        next();
    };
}
exports.authenticate = authMiddleware;
exports.authorize = requireRole;
async function optionalAuthMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return next();
    }
    const token = authHeader.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if (payload.sid) {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: payload.userId },
                select: { currentSessionId: true }
            });
            if (user && user.currentSessionId !== payload.sid) {
                return next(); // invalid session, continue as guest
            }
        }
        req.user = payload;
        next();
    }
    catch (error) {
        next();
    }
}
//# sourceMappingURL=auth.middleware.js.map