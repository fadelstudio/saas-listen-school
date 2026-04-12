"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const zod_1 = require("zod");
const AppError_1 = require("../errors/AppError");
const response_1 = require("../../utils/response");
const env_1 = require("../config/env");
function errorMiddleware(err, _req, res, _next) {
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        (0, response_1.sendError)(res, "Validation failed", 422, err.flatten().fieldErrors);
        return;
    }
    // Known operational errors
    if (err instanceof AppError_1.AppError) {
        (0, response_1.sendError)(res, err.message, err.statusCode);
        return;
    }
    // Unknown errors — never expose stack in production
    const message = env_1.env.NODE_ENV === "development" && err instanceof Error
        ? err.message
        : "Internal server error";
    console.error("❌ Unhandled error:", err);
    (0, response_1.sendError)(res, message, 500);
}
//# sourceMappingURL=error.middleware.js.map