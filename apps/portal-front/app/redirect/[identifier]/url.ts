import { NextRequest } from 'next/server';

export const getLoginRedirectionURL = (
  baseUrlFront: string,
  request: NextRequest
) => {
  const baseURL = new URL(`${baseUrlFront}/login`);
  const redirectURL = new URL(request.url);
  redirectURL.hostname = baseURL.hostname;
  redirectURL.protocol = baseURL.protocol;
  redirectURL.port = baseURL.port;
  baseURL.searchParams.set('redirect', btoa(redirectURL.toString()));
  return baseURL.toString();
};
