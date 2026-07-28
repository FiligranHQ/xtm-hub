import { logFrontendError } from '@/components/error-frontend-log.graphql';
import { getClientEnvironment } from '@/relay/environment/registry';

export const isSafeRedirect = (url: string): boolean => {
  return url.startsWith('/') && !url.startsWith('//');
};

/**
 * Builds a safe login redirect URL with the current pathname base64-encoded
 * as a query param. Returns '/login' when no pathname is provided.
 * Single canonical way to produce a login redirect URL on the frontend.
 */
export const buildLoginRedirect = (
  pathname: string | null | undefined
): string => {
  if (!pathname) return '/login';
  return `/login?redirect=${encodeURIComponent(btoa(pathname))}`;
};

/**
 * Builds a safe signup redirect URL with the current pathname base64-encoded
 * as a query param.
 * Returns '/sign-up' when no pathname is provided.
 */
export const buildSignupRedirect = (
  pathname: string | null | undefined
): string => {
  if (!pathname) return '/sign-up';
  return `/sign-up?redirect=${encodeURIComponent(btoa(pathname))}`;
};

/**
 * Decodes a base64-encoded redirect parameter and validates it is a safe
 * relative path to prevent open redirect attacks (CWE-601).
 * Logs a warning when the param is unsafe or malformed.
 * Returns the decoded path if safe, null otherwise.
 */
export const decodeSafeRedirect = (
  b64: string | null | undefined
): string | null => {
  if (!b64) return null;
  try {
    const decoded = atob(b64);
    if (isSafeRedirect(decoded)) {
      return decoded;
    }
    const env = getClientEnvironment();
    if (env) {
      logFrontendError(env, `Unsafe redirect param detected: ${decoded}`);
    }
    return null;
  } catch {
    const env = getClientEnvironment();
    if (env) {
      logFrontendError(env, 'Malformed base64 redirect param');
    }
    return null;
  }
};
