import { createError } from 'apollo-errors';

enum ErrorCategory {
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  TECHNICAL = 'TECHNICAL',
}

export const errorUtil = (
  name: string,
  message?: string,
  data?: Record<string, unknown>
) => {
  const Exception = createError(name, { data, message: message ?? name });
  return new Exception();
};

export const AlreadyExistsError = (
  message?: string,
  data?: Record<string, unknown>
) =>
  errorUtil('ALREAY_EXISTS', message, {
    http_status: 409,
    genre: ErrorCategory.CONFLICT,
    ...data,
  });

export const ForbiddenAccessError = (
  message?: string,
  data?: Record<string, unknown>
) =>
  errorUtil('FORBIDDEN_ACCESS', message, {
    http_status: 403,
    genre: ErrorCategory.TECHNICAL,
    ...data,
  });

export const UnknownError = (message: string, data?: Record<string, unknown>) =>
  errorUtil('UNKNOWN_ERROR', message, {
    http_status: 500,
    genre: ErrorCategory.TECHNICAL,
    ...data,
  });
