import { URL } from 'node:url';
import { logApp } from './app-logger.util';
import { isNotEmptyField } from './utils';

export const extractRefererPathFromReq = (req) => {
  if (isNotEmptyField(req.headers.referer)) {
    try {
      const refererUrl = new URL(req.headers.referer);
      // Keep only the pathname to prevent OPEN REDIRECT CWE-601
      return refererUrl.pathname;
    } catch {
      // prevent any invalid referer
      logApp.warn('Invalid referer for redirect extraction', {
        referer: req.headers.referer,
      });
    }
  }
  return undefined;
};
