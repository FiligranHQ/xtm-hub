import { defaultLocale, publicLocales } from '@/i18n/config';
import { manageRequest } from '@/utils/middleware/graphql-request.util';
import createMiddleware from 'next-intl/middleware';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: publicLocales,
  defaultLocale,
  localePrefix: 'always',
});

const PUBLIC_LOCALE_PATH = new RegExp(
  `^/(${publicLocales.join('|')})(/|$)|^/$`
);

export async function proxy(request: NextRequest, _: NextFetchEvent) {
  const proxyResponse = await manageRequest(request);
  if (proxyResponse) {
    return proxyResponse;
  }

  const { pathname } = request.nextUrl;

  if (PUBLIC_LOCALE_PATH.test(pathname) || !pathname.startsWith('/app')) {
    return intlMiddleware(request);
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
    '/',
    '/(en|ja)/:path*',
    '/cybersecurity-solutions',
    '/cybersecurity-solutions/:path*',
    '/graphql-api',
    '/graphql-sse',
    '/auth/:path*',
    '/document/get/:filename*',
    '/document/visualize/:serviceInstanceId/:filename*',
    '/document/deploy/:serviceInstanceId/:filename*',
    '/document/images/:documentId*',
    '/user/picture/:userId*',
    '/app/:path*',
    '/api/chatbot/:path*',
  ],
};
