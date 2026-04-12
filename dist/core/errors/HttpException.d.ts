import { AppError } from './AppError';
export declare class BadRequestException extends AppError {
    constructor(message?: string);
}
export declare class UnauthorizedException extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenException extends AppError {
    constructor(message?: string);
}
export declare class NotFoundException extends AppError {
    constructor(resource?: string);
}
export declare class ConflictException extends AppError {
    constructor(message?: string);
}
export declare class UnprocessableEntityException extends AppError {
    constructor(message?: string);
}
export declare class TooManyRequestsException extends AppError {
    constructor(message?: string);
}
export declare class InternalServerException extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=HttpException.d.ts.map