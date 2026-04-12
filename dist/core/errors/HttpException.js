"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerException = exports.TooManyRequestsException = exports.UnprocessableEntityException = exports.ConflictException = exports.NotFoundException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = void 0;
const AppError_1 = require("./AppError");
// Pre-built HTTP exceptions for common cases
class BadRequestException extends AppError_1.AppError {
    constructor(message = 'Bad request') {
        super(message, 400);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends AppError_1.AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends AppError_1.AppError {
    constructor(message = 'Forbidden — insufficient permissions') {
        super(message, 403);
    }
}
exports.ForbiddenException = ForbiddenException;
class NotFoundException extends AppError_1.AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}
exports.NotFoundException = NotFoundException;
class ConflictException extends AppError_1.AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}
exports.ConflictException = ConflictException;
class UnprocessableEntityException extends AppError_1.AppError {
    constructor(message = 'Validation failed') {
        super(message, 422);
    }
}
exports.UnprocessableEntityException = UnprocessableEntityException;
class TooManyRequestsException extends AppError_1.AppError {
    constructor(message = 'Too many requests — slow down') {
        super(message, 429);
    }
}
exports.TooManyRequestsException = TooManyRequestsException;
class InternalServerException extends AppError_1.AppError {
    constructor(message = 'Internal server error') {
        super(message, 500, false); // not operational — unexpected
    }
}
exports.InternalServerException = InternalServerException;
//# sourceMappingURL=HttpException.js.map