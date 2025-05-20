import { createError } from 'apollo-errors';
import { logApp } from './app-logger.util';

interface Information {
  detail?: Error | string;
  [key: string]: unknown;
}

enum ErrorCategory {
  BadRequest = 'BAD_REQUEST',
  Conflict = 'CONFLICT',
  Technical = 'TECHNICAL',
}

export enum ErrorType {
  BadRequest = 'BAD_REQUEST',
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
  },
  information?: Information
) => {
  const Exception = createError(name, { data, message });
  console.trace(name, data, message);
  if (information?.detail instanceof Error) {
    console.error('Original error:', information.detail);
  }
  return new Exception();
};
export const BAD_REQUEST = 'BAD_REQUEST';
export const FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS';
export const UNKNOWN_ERROR = 'UNKNOWN_ERROR';
export const STILL_REFERENCED = 'STILL_REFERENCED';
export const ALREADY_EXISTS = 'ALREADY_EXISTS';
export const NOT_FOUND = 'NOT_FOUND';
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

export const BadRequestError = (
  message: string,
  information?: Information,
  data?: Record<string, unknown>
) => {
  return errorUtil(
    ErrorType.BadRequest,
    message || 'Request is invalid',
    {
      http_status: 400,
      genre: ErrorCategory.BadRequest,
      ...data,
    },
    information
  );
};

export const UnknownError = (
  message: string,
  information?: Information,
  data?: Record<string, unknown>
) => {
  logApp.error(message + ' details: ' + information.detail);
  return errorUtil(
    ErrorType.UnknownError,
    message || 'An unknown error has occurred',
    {
      http_status: 500,
      genre: ErrorCategory.Technical,
      ...data,
    },
    information
  );
};

export const StillReferencedError = (
  message?: string,
  information?: Information,
  data?: Record<string, unknown>
) => {
  logApp.error(message + ' details: ' + information.detail);

  return errorUtil(
    ErrorType.StillReference,
    message,
    {
      http_status: 200,
      genre: ErrorCategory.Conflict,
      ...data,
    },
    information
  );
};

export const AlreadyExistsError = (
  message?: string,
  information?: Information,
  data?: Record<string, unknown>
) => {
  logApp.error(message + ' details: ' + information.detail);

  return errorUtil(
    ErrorType.AlreadyExists,
    message,
    {
      http_status: 200,
      genre: ErrorCategory.Conflict,
      ...data,
    },
    information
  );
};

export const NotFoundError = (
  message?: string,
  information?: Information,
  data?: Record<string, unknown>
) => {
  logApp.error(
    `${message} ${information ? `details: ${information.detail}` : ''}`
  );

  return errorUtil(
    ErrorType.NotFound,
    message,
    {
      http_status: 200,
      genre: ErrorCategory.BadRequest,
      ...data,
    },
    information
  );
};
