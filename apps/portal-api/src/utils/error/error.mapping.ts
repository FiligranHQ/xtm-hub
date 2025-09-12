import {
  BadRequestErrorCode,
  ForbiddenErrorCode,
  NotFoundErrorCode,
  UnknownErrorCode,
} from './error.code';
import {
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

const unknownErrorsSet: Set<string> = new Set(Object.values(UnknownErrorCode));

const notFoundErrorsSet: Set<string> = new Set(
  Object.values(NotFoundErrorCode)
);

const errorSetMapping: Map<Set<string>, ErrorBuilder> = new Map();
errorSetMapping.set(forbiddenErrorSet, ForbiddenAccess);
errorSetMapping.set(badRequestErrorsSet, BadRequestError);
errorSetMapping.set(unknownErrorsSet, UnknownError);
errorSetMapping.set(notFoundErrorsSet, NotFoundError);

export const mapToGraphQLError = (error: Error): Error => {
  const code = error.message;
  for (const [mapping, errorBuilder] of errorSetMapping) {
    if (mapping.has(code)) {
      return errorBuilder(code, { detail: error });
    }
  }
};
