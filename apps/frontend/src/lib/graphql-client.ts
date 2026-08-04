import {
  buildCookieHeader,
  extractOperationType,
  prepareUri,
  scrubSensitiveVariables,
  UnauthenticatedError,
} from '@/lib/graphql-fetch.utils';
import { isDevelopment } from '@/lib/utils';
import { ClientError, GraphQLClient } from 'graphql-request';

const getOperationType = (body: BodyInit | null | undefined): string => {
  if (typeof body !== 'string') {
    return 'QUERY';
  }

  try {
    const parsedBody = JSON.parse(body) as { query?: string };
    return extractOperationType(parsedBody.query ?? '');
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

export function resolveGraphqlApiEndpoint() {
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

export const createPortalGraphqlClient = (cookie?: string) => {
  return new GraphQLClient(defaultGraphqlApiEndpoint, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
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

// credentials: 'include' is browser-only, so cookies must be forwarded explicitly here.
export const getAuthenticatedGraphqlClient = async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return createPortalGraphqlClient(buildCookieHeader(cookieStore.getAll()));
};
