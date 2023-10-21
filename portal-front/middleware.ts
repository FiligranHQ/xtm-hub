import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const GRAPHQL_API = '/graphql-api';
const GRAPHQL_SSE = '/graphql-see';

export function middleware(request: NextRequest) {
    const serverHttpApi = process.env.SERVER_HTTP_API ?? 'http://localhost:4001';
    if (request.nextUrl.pathname.startsWith(GRAPHQL_API)) {
        return NextResponse.rewrite(new URL(serverHttpApi + GRAPHQL_API, request.url))
    }
    if (request.nextUrl.pathname.startsWith(GRAPHQL_SSE)) {
        return NextResponse.rewrite(new URL(serverHttpApi + GRAPHQL_SSE, request.url))
    }
    // Nothing to do
    return NextResponse.next()
}

export const config = {
    matcher: ['/graphql-*'],
}