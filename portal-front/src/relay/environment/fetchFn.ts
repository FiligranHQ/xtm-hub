import { isDevelopment } from '@/lib/utils';
import { createClient } from 'graphql-sse';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import {
  GraphQLResponse,
  Observable,
  RequestParameters,
  Variables,
} from 'relay-runtime';

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

export async function networkFetch({
  apiUri = '/graphql-api',
  request,
  variables,
  portalCookie,
  cache = portalCookie ? 'no-store' : undefined,
  redirectOnAuthFailure = true,
  options = {},
}: {
  apiUri?: string;
  request: RequestParameters;
  variables: Variables;
  portalCookie?: RequestCookie;
  redirectOnAuthFailure?: boolean;
  cache?: RequestCache;
  options?: RequestInit;
}): Promise<GraphQLResponse> {
  const headers: { [k: string]: string } = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (portalCookie) {
    headers.cookie = portalCookie.name + '=' + portalCookie.value;
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
      (e: { message: string }) => e.message === 'Not authenticated.'
    );
    if (containsAuthenticationFailure) {
      // redirect to login page if needed
      if (redirectOnAuthFailure) {
        window.location.href = `/?redirect=${btoa(window.location.pathname)}`;
      } else {
        throw new Error('UNAUTHENTICATED');
      }
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
