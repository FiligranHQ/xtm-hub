import { buildCookieHeader } from '@/relay/environment/fetch-fn.utils';
import { isDevelopment } from '@/lib/utils';
import { ClientError, GraphQLClient } from 'graphql-request';

const SENSITIVE_FIELD_KEYS = new Set([
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

const scrubSensitiveVariables = (
  variables: Record<string, unknown>
): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(variables).map(([key, value]) => {
      if (SENSITIVE_FIELD_KEYS.has(key)) {
        return [key, '[HIDDEN]'];
      }
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        return [key, scrubSensitiveVariables(value as Record<string, unknown>)];
      }
      return [key, value];
    })
  );
};

const getOperationType = (body: BodyInit | null | undefined): string => {
  if (typeof body !== 'string') {
    return 'QUERY';
  }

  try {
    const parsedBody = JSON.parse(body) as { query?: string };
    const query = parsedBody.query ?? '';
    return (
      query
        .trim()
        .match(/^(query|mutation|subscription)/i)?.[1]
        ?.toUpperCase() || 'QUERY'
    );
  } catch {
    return 'QUERY';
  }
};

const logGraphQLOperation = ({
  operationName,
  variables,
  apiUri,
  operationType,
}: {
  operationName?: string;
  variables?: Record<string, unknown>;
  apiUri: string;
  operationType: string;
}) => {
  // eslint-disable-next-line no-console
  console.log(
    `[GraphQL:Client ${operationType}] ${operationName || 'Anonymous'} -> ${apiUri}`,
    {
      variables: scrubSensitiveVariables(
        (variables ?? {}) as Record<string, unknown>
      ),
    }
  );
};

function prepareUri(uri: string | undefined) {
  if (uri) {
    return uri.endsWith('/') ? uri : uri + '/';
  }

  // Default for local development.
  return 'http://localhost:4002/';
}

function resolveGraphqlApiEndpoint() {
  const isServerSide = typeof window === 'undefined';
  if (!isServerSide) {
    if (process.env.NEXT_PUBLIC_CLIENT_HTTP_API) {
      return `${prepareUri(process.env.NEXT_PUBLIC_CLIENT_HTTP_API)}graphql-api`;
    }

    return `${window.location.origin}/graphql-api`;
  }

  return `${prepareUri(process.env.SERVER_HTTP_API)}graphql-api`;
}

const defaultGraphqlApiEndpoint = 'http://localhost:4002/graphql-api';

export class UnauthenticatedError extends Error {
  constructor() {
    super('UNAUTHENTICATED');
    this.name = 'UnauthenticatedError';
  }
}

const normalizeGraphqlError = (error: unknown): never => {
  if (!(error instanceof ClientError)) {
    throw error;
  }

  const graphqlErrors = error.response.errors;
  const unauthenticatedError = graphqlErrors?.find(
    (graphqlError) => graphqlError.extensions?.code === 'UNAUTHENTICATED'
  );

  if (unauthenticatedError) {
    throw new UnauthenticatedError();
  }

  const firstGraphqlMessage = graphqlErrors?.[0]?.message;
  if (firstGraphqlMessage) {
    throw new Error(firstGraphqlMessage);
  }

  throw error;
};

type GraphQLClientCacheOptions = {
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
};

export const createPortalGraphqlClient = (
  cookie?: string,
  fetchOptions?: GraphQLClientCacheOptions
) => {
  return new GraphQLClient(defaultGraphqlApiEndpoint, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    ...fetchOptions,
    requestMiddleware: (request) => {
      const apiUri = resolveGraphqlApiEndpoint();
      if (isDevelopment()) {
        logGraphQLOperation({
          operationName: request.operationName,
          variables: request.variables as Record<string, unknown> | undefined,
          apiUri,
          operationType: getOperationType(request.body),
        });
      }

      return {
        ...request,
        url: apiUri,
      };
    },
    responseMiddleware: (response) => {
      if (response instanceof ClientError) {
        normalizeGraphqlError(response);
      }
    },
  });
};

export const portalGraphqlClient = createPortalGraphqlClient();
export const portalGraphqlClientCached = createPortalGraphqlClient(undefined, {
  next: { revalidate: 3600 },
});

/**
 * Returns an authenticated GraphQL client for use in Server Components.
 * credentials: 'include' is browser-only — cookies must be forwarded explicitly on the server.
 */
export const getAuthenticatedGraphqlClient = async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return createPortalGraphqlClient(buildCookieHeader(cookieStore.getAll()));
};

