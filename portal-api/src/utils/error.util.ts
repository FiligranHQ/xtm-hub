import { createError } from 'apollo-errors';
enum ErrorCategory {
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  TECHNICAL = 'TECHNICAL',
}

const errorUtil = (
  name: string,
  message: string,
  data: Record<string, unknown>
) => {
  const Exception = createError(name, { data, message });
  return new Exception();
};
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
    FORBIDDEN_ACCESS,
    message || 'You are not allowed to do this.',
    {
      http_status: 403,
      genre: ErrorCategory.TECHNICAL,
      ...data,
    }
  );
};

export const UnknownError = (message: string, data?: Record<string, unknown>) =>
  errorUtil(UNKNOWN_ERROR, message || 'An unknown error has occurred', {
    http_status: 500,
    genre: ErrorCategory.TECHNICAL,
    ...data,
  });

export const StillReferencedError = (
  message?: string,
  data?: Record<string, unknown>
) => {
  return errorUtil(STILL_REFERENCED, message, {
    http_status: 409,
    genre: ErrorCategory.CONFLICT,
    ...data,
  });
};

export const AlreadyExistsError = (
  message?: string,
  data?: Record<string, unknown>
) => {
  return errorUtil(ALREADY_EXISTS, message, {
    http_status: 409,
    genre: ErrorCategory.CONFLICT,
    ...data,
  });
};

export const NotFoundError = (
  message?: string,
  data?: Record<string, unknown>
) => {
  return errorUtil(NOT_FOUND, message, {
    http_status: 404,
    genre: ErrorCategory.BAD_REQUEST,
    ...data,
  });
};
