"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseMiddleware = void 0;
/**
 * Global middleware to attach helper methods to the response object.
 * This ensures all controllers use the same format.
 */
const responseMiddleware = (_req, res, next) => {
    // Success helper
    res.sendSuccess = (message, data = null, statusCode = 200, meta) => {
        const payload = {
            success: true,
            message,
            data,
            error: null,
            meta,
        };
        return res.status(statusCode).json(payload);
    };
    // Error helper
    res.sendError = (message, statusCode = 500, error = null) => {
        const payload = {
            success: false,
            message,
            data: null,
            error,
        };
        return res.status(statusCode).json(payload);
    };
    next();
};
exports.responseMiddleware = responseMiddleware;
//# sourceMappingURL=response.middleware.js.map