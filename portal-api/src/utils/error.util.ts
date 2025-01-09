import { createError } from 'apollo-errors';
import { logApp } from './app-logger.util';

enum ErrorCategory {
  BadRequest = 'BAD_REQUEST',
  Conflict = 'CONFLICT',
  Technical = 'TECHNICAL',
}

export enum ErrorType {
  ForbiddenAccess = 'FORBIDDEN_ACCESS',
  UnknownError = 'UNKNOWN_ERROR',
  StillReference = 'STILL_REFERENCED',
  AlreadyExists = 'ALREADY_EXISTS',
  NotFound = 'NOT_FOUND',
}

const errorUtil = (
  name: ErrorType,
  message: string,
  data: Record<string, unknown> & {
    genre?: ErrorCategory;
    http_status?: number;
  }
) => {
  const Exception = createError(name, { data, message });
  return new Exception();
};

export const ForbiddenAccess = (
  message: string,
  data?: Record<string, unknown>
) => {
  return errorUtil(
    ErrorType.ForbiddenAccess,
    message || 'You are not allowed to do this.',
    {
      http_status: 403,
      genre: ErrorCategory.Technical,
      ...data,
    }
  );
};

export const UnknownError = (
  message: string,
  details?: Record<string, unknown>,
  data?: Record<string, unknown>
) => {
  logApp.error(message + ' details: ' + details);
  return errorUtil(
    ErrorType.UnknownError,
    message || 'An unknown error has occurred',
    {
      http_status: 500,
      genre: ErrorCategory.Technical,
      ...data,
    }
  );
};

export const StillReferencedError = (
  message?: string,
  details?: Record<string, unknown>,
  data?: Record<string, unknown>
) => {
  logApp.error(message + ' details: ' + details);

  return errorUtil(ErrorType.StillReference, message, {
    http_status: 200,
    genre: ErrorCategory.Conflict,
    ...data,
  });
};

export const AlreadyExistsError = (
  message?: string,
  details?: Record<string, unknown>,
  data?: Record<string, unknown>
) => {
  logApp.error(message + ' details: ' + details);

  return errorUtil(ErrorType.AlreadyExists, message, {
    http_status: 200,
    genre: ErrorCategory.Conflict,
    ...data,
  });
};

export const NotFoundError = (
  message?: string,
  details?: Record<string, unknown>,
  data?: Record<string, unknown>
) => {
  logApp.error(message + ' details: ' + details);

  return errorUtil(ErrorType.NotFound, message, {
    http_status: 200,
    genre: ErrorCategory.BadRequest,
    ...data,
  });
};
