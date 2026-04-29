import { describe, expect, it } from 'vitest';
import { buildCookieHeader, scrubSensitiveVariables } from './fetch-fn.utils';

describe('scrubSensitiveVariables', () => {
  describe('sensitive top-level fields', () => {
    it.each`
      field              | input
      ${'password'}      | ${{ email: 'user@example.com', password: 's3cr3t' }}
      ${'token'}         | ${{ userId: '1', token: 'tok_abc' }}
      ${'secret'}        | ${{ name: 'app', secret: 'shh' }}
      ${'apiKey'}        | ${{ service: 'stripe', apiKey: 'sk_live_xxx' }}
      ${'api_key'}       | ${{ service: 'stripe', api_key: 'sk_live_xxx' }}
      ${'accessToken'}   | ${{ accessToken: 'eyJhb...' }}
      ${'refreshToken'}  | ${{ refreshToken: 'eyJhb...' }}
      ${'access_token'}  | ${{ access_token: 'eyJhb...' }}
      ${'refresh_token'} | ${{ refresh_token: 'eyJhb...' }}
    `(
      'hide $field at the top level',
      ({ field, input }: { field: string; input: Record<string, unknown> }) => {
        const result = scrubSensitiveVariables(input);
        expect(result[field]).toBe('[HIDDEN]');
      }
    );
  });

  describe('non-sensitive fields', () => {
    it.each`
      description        | input
      ${'string value'}  | ${{ email: 'user@example.com' }}
      ${'number value'}  | ${{ page: 1 }}
      ${'boolean value'} | ${{ active: true }}
      ${'null value'}    | ${{ cursor: null }}
      ${'array value'}   | ${{ ids: ['a', 'b', 'c'] }}
    `(
      'passes through $description unchanged',
      ({ input }: { input: Record<string, unknown> }) => {
        expect(scrubSensitiveVariables(input)).toEqual(input);
      }
    );
  });

  describe('mixed objects', () => {
    it('keeps safe fields and redacts sensitive fields in the same object', () => {
      const result = scrubSensitiveVariables({
        email: 'user@example.com',
        password: 's3cr3t',
        rememberMe: true,
      });
      expect(result).toEqual({
        email: 'user@example.com',
        password: '[HIDDEN]',
        rememberMe: true,
      });
    });
  });

  describe('nested objects', () => {
    it('recursively redacts sensitive fields inside a nested input object', () => {
      const result = scrubSensitiveVariables({
        input: {
          username: 'admin',
          password: 'hunter2',
          profile: {
            bio: 'Hello',
            token: 'nested-tok',
          },
        },
      });
      expect(result).toEqual({
        input: {
          username: 'admin',
          password: '[HIDDEN]',
          profile: {
            bio: 'Hello',
            token: '[HIDDEN]',
          },
        },
      });
    });

    it('does not recurse into arrays', () => {
      const input = {
        tags: ['a', 'b'],
        items: [{ password: 'should-not-be-scrubbed' }],
      };
      const result = scrubSensitiveVariables(input);
      expect(result).toEqual(input);
    });
  });

  describe('edge cases', () => {
    it('returns an empty object unchanged', () => {
      expect(scrubSensitiveVariables({})).toEqual({});
    });

    it('returns null as-is', () => {
      expect(scrubSensitiveVariables(null)).toBeNull();
    });

    it('returns undefined as-is', () => {
      expect(scrubSensitiveVariables(undefined)).toBeUndefined();
    });
  });

  describe('buildCookieHeader', () => {
    it.each`
      description           | input                                                                    | expected
      ${'single cookie'}    | ${[{ name: 'session', value: 'abc' }]}                                   | ${'session=abc'}
      ${'multiple cookies'} | ${[{ name: 'session', value: 'abc' }, { name: 'theme', value: 'dark' }]} | ${'session=abc; theme=dark'}
      ${'empty array'}      | ${[]}                                                                    | ${undefined}
      ${'undefined'}        | ${undefined}                                                             | ${undefined}
    `('should return $expected for $description', ({ input, expected }) => {
      expect(buildCookieHeader(input)).toBe(expected);
    });
  });
});
