import { createError } from 'apollo-errors';

export const FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS';
const CATEGORY_TECHNICAL = 'TECHNICAL';
const errorUtil = (name, message, data) => {
  const Exception = createError(name, { data, message });
  return new Exception();
};
export const ForbiddenAccess = (message, data?) =>
  errorUtil(FORBIDDEN_ACCESS, message || 'You are not allowed to do this.', {
    http_status: 403,
    genre: CATEGORY_TECHNICAL,
    ...data,
  });
