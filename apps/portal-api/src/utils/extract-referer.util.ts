import { logApp } from './app-logger.util';

// Matches any URI scheme per RFC 3986: letter followed by letters/digits/+/-/. then colon
const ABSOLUTE_URL_RE = /^[a-zA-Z][a-zA-Z0-9+\-.]*:/;

const isAbsoluteUrl = (url: string): boolean => ABSOLUTE_URL_RE.test(url);

export const toSafeRedirectPath = (url: string): string | undefined => {
  if (isAbsoluteUrl(url)) {
    logApp.warn('Non-relative URL in redirect param rejected (CWE-601)', {
      url,
    });
    return undefined;
  }

  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }

  logApp.warn('Unsafe redirect path rejected (CWE-601)', { url });
  return undefined;
};

export const resolveSessionReferer = (redirect: string): string | undefined => {
  if (!redirect) return undefined;

  let decoded: string | undefined;
  try {
    decoded = atob(redirect);
  } catch {
    logApp.error('Malformed base64 redirect param in auth request', {
      redirect,
    });
    return undefined;
  }

  return toSafeRedirectPath(decoded);
};
