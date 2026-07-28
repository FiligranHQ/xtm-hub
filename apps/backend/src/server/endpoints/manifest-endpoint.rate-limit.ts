import type { Request, Response } from 'express';
import { ipKeyGenerator, type Options } from 'express-rate-limit';
import {
  MANIFEST_RATE_MAX,
  MANIFEST_RATE_WINDOW_MS,
} from '../../modules/shareable-resource/manifest/manifest.consts';
import { logApp } from '../../utils/app-logger.util';
import {
  ManifestErrorMessage,
  sendManifestError,
} from './manifest-endpoint.errors';

const RATE_LIMIT_LOG_INTERVAL_MS = 60 * 1000;
const MAX_LOG_RATE_ENTRIES = 100;
const rateLimitLogThrottle = new Map<string, number>();

const logRateLimitThrottled = (ip: string, path: string): void => {
  const key = `${ip}|${path}`;
  const now = Date.now();
  const lastLogged = rateLimitLogThrottle.get(key);
  if (
    lastLogged !== undefined &&
    now - lastLogged < RATE_LIMIT_LOG_INTERVAL_MS
  ) {
    return;
  }

  rateLimitLogThrottle.delete(key);
  rateLimitLogThrottle.set(key, now);

  logApp.warn('[RATE-LIMIT] Manifest request rate limited', {
    ip,
    path,
    limit: MANIFEST_RATE_MAX,
    windowMs: MANIFEST_RATE_WINDOW_MS,
  });

  if (rateLimitLogThrottle.size > MAX_LOG_RATE_ENTRIES) {
    for (const [entryKey, loggedAt] of rateLimitLogThrottle) {
      if (now - loggedAt >= RATE_LIMIT_LOG_INTERVAL_MS) {
        rateLimitLogThrottle.delete(entryKey);
      }
    }
    const oldestKey = rateLimitLogThrottle.keys().next().value;
    if (
      rateLimitLogThrottle.size > MAX_LOG_RATE_ENTRIES &&
      oldestKey !== undefined
    ) {
      rateLimitLogThrottle.delete(oldestKey);
    }
  }
};

export const buildManifestRateLimiterOptions = (): Partial<Options> => ({
  windowMs: MANIFEST_RATE_WINDOW_MS,
  limit: MANIFEST_RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  // Keyed by IP only: the issue requires per-IP protection against bots, and
  // adding the User-Agent would let an attacker get one bucket per UA.
  keyGenerator: (req: Request) => ipKeyGenerator(req.ip ?? 'unknown'),
  handler: (req: Request, res: Response) => {
    logRateLimitThrottled(req.ip ?? 'unknown', req.path);
    sendManifestError(res, ManifestErrorMessage.TooManyRequests);
  },
});
