import { AppError } from './AppError';

// Pre-built HTTP exceptions for common cases

export class BadRequestException extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenException extends AppError {
  constructor(message = 'Forbidden — insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundException extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictException extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

export class UnprocessableEntityException extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 422);
  }
}

export class TooManyRequestsException extends AppError {
  constructor(message = 'Too many requests — slow down') {
    super(message, 429);
  }
}

export class InternalServerException extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, false); // not operational — unexpected
  }
}
