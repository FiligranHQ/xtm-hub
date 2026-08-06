import { logApp } from './app-logger.util';

// Matches any URI scheme per RFC 3986: letter followed by letters/digits/+/-/. then colon
const ABSOLUTE_URL_RE = /^[a-zA-Z][a-zA-Z0-9+\-.]*:/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F]/;
// Any host works: the check is that resolving the candidate keeps this origin
const PROBE_ORIGIN = 'https://redirect-probe.invalid';
const MAX_LOGGED_LENGTH = 256;

const isAbsoluteUrl = (url: string): boolean => ABSOLUTE_URL_RE.test(url);

const forLog = (value: string): string => value.slice(0, MAX_LOGGED_LENGTH);

export const toSafeRedirectPath = (url: string): string | undefined => {
  if (isAbsoluteUrl(url)) {
    logApp.warn('Non-relative URL in redirect param rejected (CWE-601)', {
      url: forLog(url),
    });
    return undefined;
  }

  // CR/LF and other control characters are stripped by URL parsers but can be
  // used for response splitting, so they are rejected before parsing.
  if (!url.startsWith('/') || CONTROL_CHARS_RE.test(url)) {
    logApp.warn('Unsafe redirect path rejected (CWE-601)', {
      url: forLog(url),
    });
    return undefined;
  }

  // Prefix checks alone are not enough: the WHATWG parser normalises
  // backslashes to slashes, so `/\evil.test` resolves to `https://evil.test`.
  // Resolving against a probe origin and comparing catches every such variant,
  // and the normalised result is returned so we redirect to what we validated.
  let resolved: URL;
  try {
    resolved = new URL(url, PROBE_ORIGIN);
  } catch {
    logApp.warn('Unparsable redirect path rejected (CWE-601)', {
      url: forLog(url),
    });
    return undefined;
  }

  if (resolved.origin !== PROBE_ORIGIN) {
    logApp.warn('Unsafe redirect path rejected (CWE-601)', {
      url: forLog(url),
    });
    return undefined;
  }

  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
};

export const resolveSessionReferer = (redirect: string): string | undefined => {
  if (!redirect) return undefined;

  let decoded: string | undefined;
  try {
    decoded = atob(redirect);
  } catch {
    logApp.error('Malformed base64 redirect param in auth request', {
      redirect: forLog(redirect),
    });
    return undefined;
  }

  return toSafeRedirectPath(decoded);
};
