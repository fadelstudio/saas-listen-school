"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = exports.ConflictError = exports.ValidationError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(resource = "Resource") {
        super(`${resource} not found`, 404);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class ValidationError extends AppError {
    constructor(message = "Validation failed") {
        super(message, 422);
    }
}
exports.ValidationError = ValidationError;
class ConflictError extends AppError {
    constructor(message = "Resource already exists") {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class BadRequestError extends AppError {
    constructor(message = "Bad request") {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
//# sourceMappingURL=AppError.js.map