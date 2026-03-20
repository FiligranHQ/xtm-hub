import { createError } from 'apollo-errors';
import { logApp } from '../app-logger.util';
import {
  CustomApolloError,
  ErrorCategory,
  ErrorInformation,
  ErrorLogLevel,
  ErrorType,
} from './error.type';

const errorUtil = (
  name: ErrorType,
  message: string,
  data: Record<string, unknown> & {
    genre?: ErrorCategory;
    http_status?: number;
  },
  information?: ErrorInformation,
  logLevel: ErrorLogLevel = 'error'
): CustomApolloError => {
  const Exception = createError(name, { data, message });
  const errorDetails = {
    data,
    message,
    ...(information?.detail instanceof Error
      ? { detail: information.detail }
      : {}),
  };
  logApp[logLevel](name, errorDetails);
  const instance = new Exception() as CustomApolloError;
  instance._logLevel = logLevel;
  return instance;
};

export type ErrorBuilder = (
  message: string,
  information?: ErrorInformation
) => CustomApolloError;

export const ForbiddenAccess = (
  message: string,
  data?: Record<string, unknown>,
  logLevel: ErrorLogLevel = 'error'
): CustomApolloError => {
  return errorUtil(
    ErrorType.ForbiddenAccess,
    message || 'You are not allowed to do this.',
    {
      http_status: 403,
      genre: ErrorCategory.Technical,
      ...data,
    },
    undefined,
    logLevel
  );
};

export const BadRequestError: ErrorBuilder = (
  message: string,
  information?: ErrorInformation,
  data?: Record<string, unknown>
): CustomApolloError => {
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

export const UnknownError: ErrorBuilder = (
  message: string,
  information?: ErrorInformation,
  data?: Record<string, unknown>
): CustomApolloError => {
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

export const StillReferencedError: ErrorBuilder = (
  message?: string,
  information?: ErrorInformation,
  data?: Record<string, unknown>
): CustomApolloError => {
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

export const AlreadyExistsError: ErrorBuilder = (
  message?: string,
  information?: ErrorInformation,
  data?: Record<string, unknown>
): CustomApolloError => {
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

export const NotFoundError: ErrorBuilder = (
  message?: string,
  information?: ErrorInformation,
  data?: Record<string, unknown>
): CustomApolloError => {
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
