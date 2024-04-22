import { NextRequest, NextResponse } from 'next/server';

const GRAPHQL_API = '/graphql-api';
const GRAPHQL_SSE = '/graphql-sse';

export const manageGraphQLRequest = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const serverHttpApi = process.env.SERVER_HTTP_API ?? 'http://localhost:4001';
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
  return undefined;
};
