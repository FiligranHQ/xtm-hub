import { manageRequest } from '@/utils/middleware/graphqlRequest.util';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest, _: NextFetchEvent) {
  return (await manageRequest(request)) || NextResponse.next();
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
    '/cybersecurity-solutions/opencti-connectors/:path*',
  ],
};
