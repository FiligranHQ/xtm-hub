import { manageRequest } from '@/utils/middleware/graphqlRequest.util';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest, _: NextFetchEvent) {
  const proxyResponse = await manageRequest(request);
  if (proxyResponse) {
    return proxyResponse;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    'x-pathname',
    request.nextUrl.pathname + request.nextUrl.search
  );
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/graphql-api',
    '/graphql-sse',
    '/auth/:path*',
    '/document/get/:filename*',
    '/document/visualize/:serviceInstanceId/:filename*',
    '/document/deploy/:serviceInstanceId/:filename*',
    '/document/images/:documentId*',
    '/user/picture/:userId*',
    '/app/:path*',
  ],
};
