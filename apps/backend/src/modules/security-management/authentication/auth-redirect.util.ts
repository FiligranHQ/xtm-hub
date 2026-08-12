import { resolveSessionReferer } from '../../../utils/extract-referer.util';

export const AUTHENTICATED_HOME = '/app';

/**
 * Express exposes a repeated query param (?redirect=a&redirect=b) as an array
 * and bracket syntax as an object, so anything but a plain string is discarded.
 */
export const resolveSafeRedirect = (redirect: unknown): string | undefined =>
  typeof redirect === 'string' ? resolveSessionReferer(redirect) : undefined;
