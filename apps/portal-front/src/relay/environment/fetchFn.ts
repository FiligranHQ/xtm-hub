import { isDevelopment } from '@/lib/utils';
import { createClient } from 'graphql-sse';
import {
  GraphQLResponse,
  Observable,
  RequestParameters,
  Variables,
} from 'relay-runtime';
import { scrubSensitiveVariables } from './fetchFn.utils';

function prepareUri(uri: string | undefined) {
  if (uri) {
    return uri.endsWith('/') ? uri : uri + '/';
  } else {
    // Default for dev
    return 'http://localhost:4002/';
  }
}

export function getGraphqlApi(serverSide: boolean, type: 'sse' | 'api') {
  if (serverSide) {
    return prepareUri(process.env.SERVER_HTTP_API) + ('graphql-' + type);
  } else {
    return (
      prepareUri(process.env.NEXT_PUBLIC_CLIENT_HTTP_API) + ('graphql-' + type)
    );
  }
}

export class UnauthenticatedError extends Error {
  constructor() {
    super('UNAUTHENTICATED');
    this.name = 'UnauthenticatedError';
  }
}

export async function networkFetch({
  apiUri = '/graphql-api',
  request,
  variables,
  cookieList,
  cache = cookieList?.length ? 'no-store' : undefined,
  options = {},
}: {
  apiUri?: string;
  request: RequestParameters;
  variables: Variables;
  cookieList?: { name: string; value: string }[];
  cache?: RequestCache;
  options?: RequestInit;
}): Promise<GraphQLResponse> {
  if (isDevelopment()) {
    logGraphQLOperation(request, variables, apiUri);
  }

  const headers: { [k: string]: string } = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (cookieList?.length) {
    headers.cookie = cookieList
      .map((ck) => `${ck.name}=${ck.value}`)
      .join('; ');
  }

  const activeCacheConfig = isDevelopment()
    ? 'no-store'
    : Boolean(options.cache)
      ? options.cache
      : cache;

  if (activeCacheConfig === 'no-store' && options.next?.revalidate) {
    delete options.next.revalidate;
  }

  const resp = await fetch(apiUri, {
    method: 'POST',
    credentials: 'same-origin',
    headers,
    body: JSON.stringify({
      query: request.text,
      variables,
      operationName: request.name,
    }),
    ...options,
    cache: activeCacheConfig,
  });
  const json = await resp.json();
  // GraphQL returns exceptions (for example, a missing required variable) in the "errors"
  // property of the response. If any exceptions occurred when processing the request,
  // throw an error to indicate to the developer what went wrong.
  if (Array.isArray(json.errors)) {
    const containsAuthenticationFailure = json.errors.find(
      (e: { extensions?: { code?: string }; message: string }) =>
        e.extensions?.code === 'UNAUTHENTICATED'
    );
    if (containsAuthenticationFailure) {
      throw new UnauthenticatedError();
    }
    throw new Error(json.errors[0].message);
  }
  return json;
}

const subscriptionsClient = createClient({
  url: '/graphql-sse',
});

export function fetchOrSubscribe(
  operation: RequestParameters,
  variables: Variables
): Observable<never> {
  return Observable.create((sink) => {
    if (!operation.text) {
      return sink.error(new Error('Operation text cannot be empty'));
    }
    return subscriptionsClient.subscribe(
      {
        operationName: operation.name,
        query: operation.text,
        variables,
      },
      sink
    );
  });
}

export function logGraphQLOperation(
  request: RequestParameters,
  variables: Variables,
  apiUri: string
) {
  const operationName = request.name || 'Anonymous';
  const query = request.text || '';
  const operationType =
    query
      .trim()
      .match(/^(query|mutation|subscription)/i)?.[1]
      ?.toUpperCase() || 'QUERY';
  // eslint-disable-next-line no-console
  console.log(`[GraphQL ${operationType}] ${operationName} → ${apiUri}`, {
    variables: scrubSensitiveVariables(variables ?? {}),
  });
}
