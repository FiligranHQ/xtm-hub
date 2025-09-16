import { ApolloError } from 'apollo-errors';

export interface ErrorInformation {
  detail?: Error | string;
  [key: string]: unknown;
}

export enum ErrorCategory {
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

export type CustomApolloError = ApolloError & {
  data: {
    genre?: ErrorCategory;
    http_status?: number;
  };
};
