"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireRole = requireRole;
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
        if (payload.role !== "SUPERADMIN" && !payload.schoolId) {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: payload.userId },
                select: {
                    schoolId: true,
                    campus: { select: { schoolId: true } },
                },
            });
            const resolvedSchoolId = user?.schoolId || user?.campus?.schoolId || null;
            if (!resolvedSchoolId) {
                throw new AppError_1.UnauthorizedError("Token missing school context. Please log in again.");
            }
            payload.schoolId = resolvedSchoolId;
        }
        req.user = payload;
        next();
    }
    catch {
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
//# sourceMappingURL=auth.middleware.js.map