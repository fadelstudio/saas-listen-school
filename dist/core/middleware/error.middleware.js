"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const zod_1 = require("zod");
const AppError_1 = require("../errors/AppError");
const env_1 = require("../config/env");
const client_1 = require("@prisma/client");
function errorMiddleware(err, _req, res, _next) {
    const sendError = typeof res.sendError === "function"
        ? (message, statusCode = 500, error = null) => res.sendError(message, statusCode, error)
        : (message, statusCode = 500, error = null) => res.status(statusCode).json({
            success: false,
            message,
            data: null,
            error,
        });
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        sendError("Validation failed", 422, err.flatten().fieldErrors);
        return;
    }
    // Known operational errors
    if (err instanceof AppError_1.AppError) {
        sendError(err.message, err.statusCode);
        return;
    }
    // Prisma Database Errors (Suppress raw stack trace in output but log for dev)
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        console.error("🛠️ Prisma DB Error:", err); // Developer log
        const code = err.code;
        if (code === 'P2002') {
            sendError("Validation failed: This resource already exists (Unique constraint).", 409);
            return;
        }
        if (code === 'P2003') {
            sendError("Validation failed: Invalid reference (Foreign key constraint).", 422);
            return;
        }
        if (code === 'P2025') {
            sendError("Resource not found or already deleted.", 404);
            return;
        }
        if (code === 'P2022') {
            sendError("Database schema is outdated. Please run the latest migrations.", 500);
            return;
        }
        sendError("A database error occurred.", 422);
        return;
    }
    // Unknown errors — never expose stack in production
    const message = env_1.env.NODE_ENV === "development" && err instanceof Error
        ? err.message
        : "Internal server error";
    console.error("❌ Unhandled error:", err);
    sendError(message, 500);
}
//# sourceMappingURL=error.middleware.js.map