import { CONSENT_VERSION } from '@/components/cookie-consent/cookie-consent.consts';
import { CookieConsentProvider } from '@/components/cookie-consent/CookieConsentProvider';
import { ManagedScripts } from '@/components/cookie-consent/ManagedScripts';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// The external scripts load third-party code: stub them at that boundary.
vi.mock('@/components/external/GoogleAnalytics', () => ({
  default: () => <div data-testid="google-analytics-script" />,
}));
vi.mock('@/components/external/Hubspot', () => ({
  default: () => <div data-testid="hubspot-script" />,
}));

const renderManagedScripts = (services: Record<string, boolean>) =>
  testRender(
    <CookieConsentProvider
      initialConsent={{
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString(),
        services,
      }}>
      <ManagedScripts />
    </CookieConsentProvider>
  );

describe('ManagedScripts', () => {
  it.each`
    services                                         | gaLoaded | hubspotLoaded
    ${{ 'google-analytics': false, hubspot: false }} | ${false} | ${false}
    ${{ 'google-analytics': true, hubspot: false }}  | ${true}  | ${false}
    ${{ 'google-analytics': false, hubspot: true }}  | ${false} | ${true}
    ${{ 'google-analytics': true, hubspot: true }}   | ${true}  | ${true}
  `(
    'should load Google Analytics: $gaLoaded and HubSpot: $hubspotLoaded when consent is $services',
    ({ services, gaLoaded, hubspotLoaded }) => {
      // Given / When
      renderManagedScripts(services);

      // Then
      expect(!!screen.queryByTestId('google-analytics-script')).toBe(gaLoaded);
      expect(!!screen.queryByTestId('hubspot-script')).toBe(hubspotLoaded);
    }
  );
});
