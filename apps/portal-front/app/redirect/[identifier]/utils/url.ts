import { NextRequest } from 'next/server';

export const getLoginRedirectionURL = (
  baseUrlFront: string,
  request: NextRequest
) => {
  const baseURL = new URL(`${baseUrlFront}/login`);
  const redirectURL = new URL(request.url);
  // Encode only the relative path — full absolute URLs are rejected by decodeSafeRedirect
  const relativePath = redirectURL.pathname + redirectURL.search;
  baseURL.searchParams.set('redirect', btoa(relativePath));
  return baseURL.toString();
};
