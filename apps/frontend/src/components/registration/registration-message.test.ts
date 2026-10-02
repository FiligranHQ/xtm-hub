import { PlatformIdentifier } from '@graphql/generated';
import { describe, expect, it, vi } from 'vitest';
import {
  buildRegistrationMessage,
  postRegistrationMessage,
  registrationMessageTarget,
} from './registration-message';

const TOKEN = '2f0b7d1e-6f7a-4a4b-9c3d-1e2f3a4b5c6d';

describe('registration message', () => {
  it.each`
    identifier                    | platformUrl                             | expected
    ${PlatformIdentifier.Xtmone}  | ${'https://xtm.example.com/xtm-one'}    | ${'https://xtm.example.com'}
    ${PlatformIdentifier.Xtmone}  | ${'http://localhost:4000'}              | ${'http://localhost:4000'}
    ${PlatformIdentifier.Xtmone}  | ${'javascript:alert(1)'}                | ${null}
    ${PlatformIdentifier.Xtmone}  | ${'not a url'}                          | ${null}
    ${PlatformIdentifier.Opencti} | ${'https://opencti.example.com'}        | ${'*'}
    ${PlatformIdentifier.Openaev} | ${'https://openaev.example.com/tenant'} | ${'*'}
  `(
    'should target $expected when $identifier declares $platformUrl',
    ({ identifier, platformUrl, expected }) => {
      // Given / When
      const target = registrationMessageTarget(identifier, platformUrl);

      // Then
      expect(target).toBe(expected);
    }
  );

  it('should echo the state for XTM One only', () => {
    // Given
    const message = { action: 'register' as const, token: TOKEN };

    // When / Then
    expect(
      buildRegistrationMessage(PlatformIdentifier.Xtmone, message, 's-1')
    ).toEqual({ action: 'register', token: TOKEN, state: 's-1' });
    expect(
      buildRegistrationMessage(PlatformIdentifier.Opencti, message, 's-1')
    ).toEqual({ action: 'register', token: TOKEN });
  });

  it('should post the XTM One token to the platform origin only', () => {
    // Given
    const opener = { postMessage: vi.fn() };

    // When
    const delivered = postRegistrationMessage(
      opener,
      PlatformIdentifier.Xtmone,
      'https://xtm.example.com/xtm-one',
      { action: 'register', token: TOKEN },
      's-1'
    );

    // Then
    expect(delivered).toBe(true);
    expect(opener.postMessage).toHaveBeenCalledExactlyOnceWith(
      { action: 'register', token: TOKEN, state: 's-1' },
      'https://xtm.example.com'
    );
  });

  it('should post nothing when there is no opener or the platform URL is not an http(s) URL', () => {
    // Given
    const opener = { postMessage: vi.fn() };

    // When
    const withoutOpener = postRegistrationMessage(
      null,
      PlatformIdentifier.Xtmone,
      'https://xtm.example.com',
      { action: 'cancel' }
    );
    const withBadUrl = postRegistrationMessage(
      opener,
      PlatformIdentifier.Xtmone,
      'javascript:alert(1)',
      { action: 'register', token: TOKEN }
    );

    // Then
    expect([withoutOpener, withBadUrl]).toEqual([false, false]);
    expect(opener.postMessage).not.toHaveBeenCalled();
  });
});
