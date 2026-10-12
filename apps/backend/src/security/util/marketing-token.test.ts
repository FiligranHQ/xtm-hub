import type { Request } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Dev value whose hash and salt are in config/development.json and config/test.json.
const DEV_MARKETING_TOKEN = 'changeMeMarketing';

const buildRequest = (token?: string) =>
  ({
    header: (name: string) =>
      name.toLowerCase() === 'x-xtm-hub-marketing-token' ? token : undefined,
  }) as unknown as Request;

const loadWithConfig = async (values: Record<string, string>) => {
  vi.resetModules();
  vi.doMock('config', () => ({
    default: { get: (key: string) => values[key] },
  }));
  return import('./marketing-token');
};

describe('isValidMarketingToken', () => {
  afterEach(() => {
    vi.doUnmock('config');
    vi.resetModules();
  });

  it('accepts the dev token with the development/test config', async () => {
    vi.resetModules();
    const { isValidMarketingToken } = await import('./marketing-token');

    expect(isValidMarketingToken(buildRequest(DEV_MARKETING_TOKEN))).toBe(true);
    expect(isValidMarketingToken(buildRequest('invalid-token'))).toBe(false);
    expect(isValidMarketingToken(buildRequest())).toBe(false);
  });

  it.each`
    description        | values
    ${'hash and salt'} | ${{ marketing_token_hash: '', marketing_token_salt: '' }}
    ${'hash'}          | ${{ marketing_token_hash: '', marketing_token_salt: 'f883a2941904b524a40a8a79aafdedd8' }}
    ${'salt'}          | ${{ marketing_token_hash: 'some-hash', marketing_token_salt: '' }}
  `(
    'rejects every token when the environment does not configure the $description',
    async ({ values }) => {
      const { isValidMarketingToken } = await loadWithConfig(values);

      expect(isValidMarketingToken(buildRequest(DEV_MARKETING_TOKEN))).toBe(
        false
      );
      expect(isValidMarketingToken(buildRequest(''))).toBe(false);
    }
  );
});
