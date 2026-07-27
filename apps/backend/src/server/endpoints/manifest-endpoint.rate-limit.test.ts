import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MANIFEST_RATE_MAX,
  MANIFEST_RATE_WINDOW_MS,
} from '../../modules/shareable-resource/manifest/manifest.consts';
import { logApp } from '../../utils/app-logger.util';
import { ManifestErrorMessage } from './manifest-endpoint.errors';
import { buildManifestRateLimiterOptions } from './manifest-endpoint.rate-limit';

const buildRequest = (ip: string, userAgent = 'agent-a') =>
  ({
    ip,
    path: '/opencti/7.1.0/connector/manifests',
    headers: { 'user-agent': userAgent },
  }) as unknown as Request;

const buildResponse = () => {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { res: { status } as unknown as Response, status, json };
};

describe('buildManifestRateLimiterOptions', () => {
  it('builds the limiter with the configured window and limit', () => {
    const options = buildManifestRateLimiterOptions();

    expect(options.windowMs).toBe(MANIFEST_RATE_WINDOW_MS);
    expect(options.limit).toBe(MANIFEST_RATE_MAX);
  });

  it('enables standard headers so clients receive Retry-After', () => {
    const options = buildManifestRateLimiterOptions();

    expect(options.standardHeaders).toBe(true);
    expect(options.legacyHeaders).toBe(false);
  });

  it('keys the limiter by IP only, ignoring the User-Agent', async () => {
    const keyGenerator = buildManifestRateLimiterOptions().keyGenerator!;
    const res = buildResponse().res;

    const first = await keyGenerator(buildRequest('10.0.0.1', 'agent-a'), res);
    const second = await keyGenerator(buildRequest('10.0.0.1', 'agent-b'), res);

    expect(first).toBe(second);
  });
});

describe('manifest rate limit handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a body matching the error contract when the limit is reached', () => {
    const handler = buildManifestRateLimiterOptions().handler!;
    const { res, status, json } = buildResponse();

    handler(buildRequest('10.0.1.1'), res, vi.fn(), {} as never);

    expect(status).toHaveBeenCalledWith(429);
    expect(json).toHaveBeenCalledWith({
      code: 429,
      message: ManifestErrorMessage.TooManyRequests,
    });
  });

  it('logs a warning on the first rejection', () => {
    const warn = vi.spyOn(logApp, 'warn').mockImplementation(() => undefined);
    const handler = buildManifestRateLimiterOptions().handler!;

    handler(
      buildRequest('10.0.2.1'),
      buildResponse().res,
      vi.fn(),
      {} as never
    );

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('does not log again within the throttling interval', () => {
    const warn = vi.spyOn(logApp, 'warn').mockImplementation(() => undefined);
    const handler = buildManifestRateLimiterOptions().handler!;

    handler(
      buildRequest('10.0.3.1'),
      buildResponse().res,
      vi.fn(),
      {} as never
    );
    handler(
      buildRequest('10.0.3.1'),
      buildResponse().res,
      vi.fn(),
      {} as never
    );

    expect(warn).toHaveBeenCalledTimes(1);
  });
});
