import { NextRequest, NextResponse } from 'next/server';

export const GRAPHQL_API = '/graphql-api';
export const GRAPHQL_SSE = '/graphql-sse';

export const manageRequest = (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;
  const serverHttpApi = process.env.SERVER_HTTP_API ?? 'http://localhost:4002';
  console.log(serverHttpApi);
  if (pathname.startsWith(GRAPHQL_API)) {
    return NextResponse.rewrite(
      new URL(serverHttpApi + GRAPHQL_API, request.url)
    );
  }
  if (pathname.startsWith(GRAPHQL_SSE)) {
    return NextResponse.rewrite(
      new URL(serverHttpApi + GRAPHQL_SSE, request.url)
    );
  }

  if (pathname.startsWith('/auth')) {
    return NextResponse.rewrite(
      new URL(serverHttpApi + pathname + search, request.url)
    );
  }

  if (pathname.startsWith('/document')) {
    return NextResponse.rewrite(new URL(serverHttpApi + pathname, request.url));
  }

  return undefined;
};
