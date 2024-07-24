import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { manageRequest } from '@/utils/middleware/graphqlRequest.util';

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  return manageRequest(request) || NextResponse.next();
}

export const config = {
  matcher: ['/graphql-api', '/graphql-sse', '/auth/:path*'],
};
