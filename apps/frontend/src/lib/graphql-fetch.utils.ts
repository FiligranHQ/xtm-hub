import { isDevelopment } from '@/lib/utils';
import { Variables } from 'relay-runtime';

export const SENSITIVE_FIELD_KEYS = new Set([
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'accessToken',
  'refreshToken',
  'access_token',
  'refresh_token',
]);

export function scrubSensitiveVariables(variables: Variables): Variables {
  if (!variables || typeof variables !== 'object') return variables;
  return Object.fromEntries(
    Object.entries(variables).map(([key, value]) => {
      if (SENSITIVE_FIELD_KEYS.has(key)) return [key, '[HIDDEN]'];
      if (Array.isArray(value)) {
        return [
          key,
          value.map((item) =>
            item !== null && typeof item === 'object'
              ? scrubSensitiveVariables(item as Variables)
              : item
          ),
        ];
      }
      if (value !== null && typeof value === 'object')
        return [key, scrubSensitiveVariables(value as Variables)];
      return [key, value];
    })
  );
}

export function buildCookieHeader(
  cookieList?: { name: string; value: string }[]
): string | undefined {
  if (!cookieList?.length) return undefined;
  return cookieList.map((ck) => `${ck.name}=${ck.value}`).join('; ');
}

export class UnauthenticatedError extends Error {
  constructor() {
    super('UNAUTHENTICATED');
    this.name = 'UnauthenticatedError';
  }
}

export type GraphqlErrorLike = {
  message: string;
  extensions?: { code?: string };
};

/**
 * Throws UnauthenticatedError on an UNAUTHENTICATED error code, otherwise
 * throws an Error with the first error's message.
 */
export function throwOnGraphqlErrors(errors?: GraphqlErrorLike[]): void {
  if (!Array.isArray(errors) || errors.length === 0) return;

  const unauthenticatedError = errors.find(
    (graphqlError) => graphqlError.extensions?.code === 'UNAUTHENTICATED'
  );
  if (unauthenticatedError) {
    throw new UnauthenticatedError();
  }

  throw new Error(errors[0]?.message ?? 'GraphQL request failed');
}

export function prepareUri(uri: string | undefined): string {
  if (uri) {
    return uri.endsWith('/') ? uri : uri + '/';
  }
  return 'http://localhost:4002/';
}

/**
 * Forces `no-store` in development so devs always see fresh data, and strips
 * `next.revalidate` from `options` when that happens (Next.js throws if both
 * `cache: 'no-store'` and `next.revalidate` are set).
 */
export function resolveActiveCacheConfig(
  cacheConfig: RequestCache | undefined,
  options: { next?: { revalidate?: number | false; tags?: string[] } }
): RequestCache | undefined {
  const activeCacheConfig = isDevelopment() ? 'no-store' : cacheConfig;

  if (
    activeCacheConfig === 'no-store' &&
    options.next?.revalidate !== undefined
  ) {
    delete options.next.revalidate;
  }

  return activeCacheConfig;
}

export function extractOperationType(query: string): string {
  return (
    query
      .trim()
      .match(/^(query|mutation|subscription)/i)?.[1]
      ?.toUpperCase() || 'QUERY'
  );
}

export function extractOperationName(query: string): string {
  return (
    query.trim().match(/^(?:query|mutation|subscription)\s+(\w+)/)?.[1] ??
    'Anonymous'
  );
}
