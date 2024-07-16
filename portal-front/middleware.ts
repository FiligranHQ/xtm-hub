import { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  GRAPHQL_API,
  GRAPHQL_SSE,
  manageRequest,
} from '@/utils/middleware/graphqlRequest.util';

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  return manageRequest(request) || NextResponse.next();
}

export const config = {
  matcher: [GRAPHQL_API, GRAPHQL_SSE, '/auth/:path*/callback'],
};
