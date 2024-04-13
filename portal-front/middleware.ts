import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { guardRoute } from '@/utils/middleware/guardRoute.util';
import { manageGraphQLRequest } from '@/utils/middleware/graphqlRequest.util';

export async function middleware(request: NextRequest) {
  return (
    manageGraphQLRequest(request) || guardRoute(request) || NextResponse.next()
  );
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth).*)'],
};
