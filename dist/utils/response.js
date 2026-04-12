"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
exports.sendCreated = sendCreated;
function sendSuccess(res, message, data, statusCode = 200) {
    const response = {
        success: true,
        message,
        data,
        error: null,
    };
    return res.status(statusCode).json(response);
}
function sendError(res, message, statusCode = 500, error = null) {
    const response = {
        success: false,
        message,
        data: null,
        error,
    };
    return res.status(statusCode).json(response);
}
function sendCreated(res, message, data) {
    return sendSuccess(res, message, data, 201);
}
//# sourceMappingURL=response.js.map