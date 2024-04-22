import {
  GraphQLResponse,
  Observable,
  RequestParameters,
  Variables,
} from 'relay-runtime';
import { createClient } from 'graphql-sse';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

function prepareUri(uri: string | undefined) {
  if (uri) {
    return uri.endsWith('/') ? uri : uri + '/';
  } else {
    // Default for dev
    return 'http://localhost:4001/';
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

export async function networkFetch(
  apiUri: string,
  request: RequestParameters,
  variables: Variables,
  portalCookie?: RequestCookie
): Promise<GraphQLResponse> {
  const headers: { [k: string]: string } = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (portalCookie) {
    headers.cookie = portalCookie.name + '=' + portalCookie.value;
  }
  const resp = await fetch(apiUri, {
    method: 'POST',
    credentials: 'same-origin',
    headers,
    cache: portalCookie ? 'no-store' : undefined,
    body: JSON.stringify({ query: request.text, variables }),
  });
  const json = await resp.json();
  // GraphQL returns exceptions (for example, a missing required variable) in the "errors"
  // property of the response. If any exceptions occurred when processing the request,
  // throw an error to indicate to the developer what went wrong.
  if (Array.isArray(json.errors)) {
    const containsAuthenticationFailure =
      json.errors.find((e: any) => e.extensions.code === 'UNAUTHENTICATED') !==
      undefined;
    if (containsAuthenticationFailure) {
      throw new Error('UNAUTHENTICATED');
    }
    console.log(json.errors);
    throw new Error('TECHNICAL');
  }
  return json;
}

const subscriptionsClient = createClient({
  url: '/graphql-sse',
  onMessage: console.log,
});

export function fetchOrSubscribe(
  operation: RequestParameters,
  variables: Variables
): Observable<any> {
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

export async function fetchResponse(
  params: RequestParameters,
  variables: Variables
) {
  return networkFetch('/graphql-api', params, variables);
}
