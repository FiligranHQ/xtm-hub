import {
  AlreadyExistsErrorCode,
  BadRequestErrorCode,
  ForbiddenErrorCode,
  NotFoundErrorCode,
  UnknownErrorCode,
} from './error.code';
import { CustomApolloError } from './error.type';
import {
  AlreadyExistsError,
  BadRequestError,
  ErrorBuilder,
  ForbiddenAccess,
  NotFoundError,
  UnknownError,
} from './error.util';

const forbiddenErrorSet: Set<string> = new Set(
  Object.values(ForbiddenErrorCode)
);

const badRequestErrorsSet: Set<string> = new Set(
  Object.values(BadRequestErrorCode)
);

const alreadyExistsErrorSet: Set<string> = new Set(
  Object.values(AlreadyExistsErrorCode)
);

const notFoundErrorsSet: Set<string> = new Set(
  Object.values(NotFoundErrorCode)
);

const errorSetMapping: Map<Set<string>, ErrorBuilder> = new Map();
errorSetMapping.set(forbiddenErrorSet, ForbiddenAccess);
errorSetMapping.set(badRequestErrorsSet, BadRequestError);
errorSetMapping.set(alreadyExistsErrorSet, AlreadyExistsError);
errorSetMapping.set(notFoundErrorsSet, NotFoundError);

export const mapToGraphQLError = (
  error: Error,
  customUnknownErrorCode: UnknownErrorCode = UnknownErrorCode.UnknownError
): CustomApolloError => {
  const code = error.message;
  for (const [mapping, errorBuilder] of errorSetMapping) {
    if (mapping.has(code)) {
      return errorBuilder(code, { detail: error });
    }
  }

  return UnknownError(customUnknownErrorCode, { detail: error });
};
