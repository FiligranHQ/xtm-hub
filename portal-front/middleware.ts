import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { manageGraphQLRequest } from '@/utils/middleware/graphqlRequest.util';

export async function middleware(request: NextRequest) {
  return manageGraphQLRequest(request) || NextResponse.next();
}

export const config = {
  matcher: ['/graphql-api', '/graphql-sse'],
};
