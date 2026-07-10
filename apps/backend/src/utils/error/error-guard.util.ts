import { UnknownErrorCode } from './error.code';

export const isErrorLikeRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (isErrorLikeRecord(error) && typeof error.message === 'string') {
    return new Error(error.message, { cause: error });
  }

  return new Error(UnknownErrorCode.UnknownError, { cause: error });
};

export const getErrorMessage = (error: unknown): string => {
  return toError(error).message;
};

export const getErrorStringProperty = (
  error: unknown,
  key: string
): string | undefined => {
  if (!isErrorLikeRecord(error)) {
    return undefined;
  }

  const value = error[key];
  return typeof value === 'string' ? value : undefined;
};

export const getErrorNumberProperty = (
  error: unknown,
  key: string
): number | undefined => {
  if (!isErrorLikeRecord(error)) {
    return undefined;
  }

  const value = error[key];
  return typeof value === 'number' ? value : undefined;
};

const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

export const isUniqueConstraintViolation = (
  error: unknown,
  constraintName: string
): boolean => {
  const code = getErrorStringProperty(error, 'code');
  const constraint = getErrorStringProperty(error, 'constraint');

  if (code === POSTGRES_UNIQUE_VIOLATION_CODE) {
    return constraint
      ? constraint === constraintName
      : getErrorMessage(error).includes(constraintName);
  }

  if (constraint) {
    return constraint === constraintName;
  }

  return getErrorMessage(error).includes(constraintName);
};
