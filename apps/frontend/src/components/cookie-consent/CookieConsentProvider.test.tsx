import { readClientConsent } from '@/components/cookie-consent/cookie-consent.client';
import {
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
} from '@/components/cookie-consent/cookie-consent.consts';
import {
  type ServiceConsent,
  type StoredConsent,
} from '@/components/cookie-consent/cookie-consent.types';
import {
  CookieConsentProvider,
  useConsent,
} from '@/components/cookie-consent/CookieConsentProvider';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const GA_SERVICE = 'google-analytics';
const HUBSPOT_SERVICE = 'hubspot';
const GA_COOKIE = '_ga';
const HUBSPOT_COOKIE = 'hubspotutk';

const allGranted: ServiceConsent = {
  [GA_SERVICE]: true,
  [HUBSPOT_SERVICE]: true,
};

const allDenied: ServiceConsent = {
  [GA_SERVICE]: false,
  [HUBSPOT_SERVICE]: false,
};

const makeStoredConsent = (
  services: ServiceConsent,
  overrides?: Partial<StoredConsent>
): StoredConsent => ({
  version: CONSENT_VERSION,
  timestamp: new Date().toISOString(),
  services,
  ...overrides,
});

const clearAllCookies = () => {
  document.cookie
    .split('; ')
    .map((entry) => entry.split('=')[0])
    .filter((name): name is string => !!name)
    .forEach((name) => {
      document.cookie = `${name}=; path=/; max-age=0`;
    });
};

const ConsentProbe = () => {
  const {
    consent,
    showBanner,
    isPreferencesOpen,
    isServiceAllowed,
    isCategoryAllowed,
    openPreferences,
    closePreferences,
    acceptAll,
    rejectAll,
    save,
  } = useConsent();

  return (
    <div>
      <span data-testid="consent">{JSON.stringify(consent)}</span>
      <span data-testid="banner">{String(showBanner)}</span>
      <span data-testid="preferences">{String(isPreferencesOpen)}</span>
      <span data-testid="ga-allowed">
        {String(isServiceAllowed(GA_SERVICE))}
      </span>
      <span data-testid="analytics-allowed">
        {String(isCategoryAllowed('analytics'))}
      </span>
      <span data-testid="necessary-allowed">
        {String(isCategoryAllowed('necessary'))}
      </span>
      <button onClick={openPreferences}>open</button>
      <button onClick={closePreferences}>close</button>
      <button onClick={acceptAll}>accept-all</button>
      <button onClick={rejectAll}>reject-all</button>
      <button onClick={() => save({ [GA_SERVICE]: true })}>save-ga</button>
    </div>
  );
};

const renderProvider = (initialConsent: StoredConsent | null) =>
  testRender(
    <CookieConsentProvider initialConsent={initialConsent}>
      <ConsentProbe />
    </CookieConsentProvider>
  );

const consentValue = () =>
  JSON.parse(screen.getByTestId('consent').textContent ?? '{}');

describe('CookieConsentProvider', () => {
  beforeEach(() => {
    clearAllCookies();
  });

  afterEach(() => {
    clearAllCookies();
  });

  describe('initial state', () => {
    it('should deny every service and show the banner when no consent is stored', () => {
      // Given / When
      renderProvider(null);

      // Then
      expect(consentValue()).toEqual(allDenied);
      expect(screen.getByTestId('banner')).toHaveTextContent('true');
    });

    it('should expose the stored consent and hide the banner when a valid consent is stored', () => {
      // Given / When
      renderProvider(makeStoredConsent(allGranted));

      // Then
      expect(consentValue()).toEqual(allGranted);
      expect(screen.getByTestId('banner')).toHaveTextContent('false');
    });

    it('should show the banner when the stored consent has an outdated version', () => {
      // Given / When
      renderProvider(
        makeStoredConsent(allGranted, { version: CONSENT_VERSION - 1 })
      );

      // Then
      expect(screen.getByTestId('banner')).toHaveTextContent('true');
    });

    it('should keep the preferences closed', () => {
      // Given / When
      renderProvider(null);

      // Then
      expect(screen.getByTestId('preferences')).toHaveTextContent('false');
    });
  });

  describe('consent helpers', () => {
    it.each`
      initial                   | expectedService | expectedCategory
      ${allGranted}             | ${'true'}       | ${'true'}
      ${allDenied}              | ${'false'}      | ${'false'}
      ${{ [GA_SERVICE]: true }} | ${'true'}       | ${'true'}
    `(
      'should report service allowed $expectedService and category allowed $expectedCategory for $initial',
      ({ initial, expectedService, expectedCategory }) => {
        // Given / When
        renderProvider(makeStoredConsent(initial));

        // Then
        expect(screen.getByTestId('ga-allowed')).toHaveTextContent(
          expectedService
        );
        expect(screen.getByTestId('analytics-allowed')).toHaveTextContent(
          expectedCategory
        );
      }
    );

    it('should always allow the necessary category', () => {
      // Given / When
      renderProvider(null);

      // Then
      expect(screen.getByTestId('necessary-allowed')).toHaveTextContent('true');
    });
  });

  describe('preferences dialog state', () => {
    it('should open then close the preferences', async () => {
      // Given
      const { user } = renderProvider(null);

      // When
      await user.click(screen.getByText('open'));

      // Then
      expect(screen.getByTestId('preferences')).toHaveTextContent('true');

      // When
      await user.click(screen.getByText('close'));

      // Then
      expect(screen.getByTestId('preferences')).toHaveTextContent('false');
    });
  });

  describe('accepting and rejecting', () => {
    it('should grant every service, hide the banner and persist the choice when accepting all', async () => {
      // Given
      const { user } = renderProvider(null);

      // When
      await user.click(screen.getByText('accept-all'));

      // Then
      expect(consentValue()).toEqual(allGranted);
      expect(screen.getByTestId('banner')).toHaveTextContent('false');
      expect(readClientConsent()?.services).toEqual(allGranted);
    });

    it('should deny every service, hide the banner and persist the choice when rejecting all', async () => {
      // Given
      const { user } = renderProvider(null);

      // When
      await user.click(screen.getByText('reject-all'));

      // Then
      expect(consentValue()).toEqual(allDenied);
      expect(screen.getByTestId('banner')).toHaveTextContent('false');
      expect(readClientConsent()?.services).toEqual(allDenied);
    });

    it('should save the given services, normalizing the missing ones and closing the preferences', async () => {
      // Given
      const { user } = renderProvider(null);
      await user.click(screen.getByText('open'));

      // When
      await user.click(screen.getByText('save-ga'));

      // Then
      expect(consentValue()).toEqual({
        [GA_SERVICE]: true,
        [HUBSPOT_SERVICE]: false,
      });
      expect(screen.getByTestId('preferences')).toHaveTextContent('false');
    });

    it('should close the preferences when accepting all', async () => {
      // Given
      const { user } = renderProvider(null);
      await user.click(screen.getByText('open'));

      // When
      await user.click(screen.getByText('accept-all'));

      // Then
      expect(screen.getByTestId('preferences')).toHaveTextContent('false');
    });
  });

  describe('revoking consent', () => {
    it('should purge the cookies of the revoked services only', async () => {
      // Given
      document.cookie = `${GA_COOKIE}=1; path=/`;
      document.cookie = `${HUBSPOT_COOKIE}=1; path=/`;
      document.cookie = 'session=1; path=/';
      const { user } = renderProvider(makeStoredConsent(allGranted));

      // When
      await user.click(screen.getByText('save-ga'));

      // Then
      expect(document.cookie).toContain(`${GA_COOKIE}=1`);
      expect(document.cookie).toContain('session=1');
      expect(document.cookie).not.toContain(HUBSPOT_COOKIE);
    });

    it('should purge every service cookie when rejecting all after a full consent', async () => {
      // Given
      document.cookie = `${GA_COOKIE}=1; path=/`;
      document.cookie = `${HUBSPOT_COOKIE}=1; path=/`;
      const { user } = renderProvider(makeStoredConsent(allGranted));

      // When
      await user.click(screen.getByText('reject-all'));

      // Then
      expect(document.cookie).not.toContain(GA_COOKIE);
      expect(document.cookie).not.toContain(HUBSPOT_COOKIE);
      expect(document.cookie).toContain(CONSENT_COOKIE_NAME);
    });

    it('should keep the service cookies when no service is revoked', async () => {
      // Given
      document.cookie = `${GA_COOKIE}=1; path=/`;
      const { user } = renderProvider(makeStoredConsent(allDenied));

      // When
      await user.click(screen.getByText('accept-all'));

      // Then
      expect(document.cookie).toContain(`${GA_COOKIE}=1`);
    });
  });

  describe('useConsent', () => {
    it('should throw when used outside of a CookieConsentProvider', () => {
      // Given
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      // When / Then
      expect(() => testRender(<ConsentProbe />)).toThrow(
        'useConsent must be used within a CookieConsentProvider'
      );
      consoleError.mockRestore();
    });
  });
});
