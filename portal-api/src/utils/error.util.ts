import { createError } from 'apollo-errors';

export const FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS';
const CATEGORY_TECHNICAL = 'TECHNICAL';

export const errorUtil = (
  name: string,
  message?: string,
  data?: Record<string, unknown>
) => {
  const Exception = createError(name, { data, message: message ?? name });
  return new Exception();
};

export const ForbiddenAccess = (
  message: string,
  data?: Record<string, unknown>
) =>
  errorUtil(FORBIDDEN_ACCESS, message || 'You are not allowed to do this.', {
    http_status: 403,
    genre: CATEGORY_TECHNICAL,
    ...data,
  });

export const UnknownError = (message: string, data?: Record<string, unknown>) =>
  errorUtil('UNKNOWN_ERROR', message || 'An unknown error has occurred', {
    http_status: 500,
    genre: CATEGORY_TECHNICAL,
    ...data,
  });
