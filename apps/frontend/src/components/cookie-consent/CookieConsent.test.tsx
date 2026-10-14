import { CookieConsent } from '@/components/cookie-consent/CookieConsent';
import { CookieConsentProvider } from '@/components/cookie-consent/CookieConsentProvider';
import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

const renderCookieConsent = (pathname: string) => {
  vi.mocked(usePathname).mockReturnValue(pathname);
  return testRender(
    <CookieConsentProvider initialConsent={null}>
      <CookieConsent />
    </CookieConsentProvider>
  );
};

describe('CookieConsent', () => {
  it.each`
    pathname
    ${'/app'}
    ${'/'}
    ${'/not-embed'}
  `(
    'should display the consent banner when the path is "$pathname"',
    ({ pathname }) => {
      // Given / When
      renderCookieConsent(pathname);

      // Then
      expect(screen.getByRole('region', { name: 'Title' })).toBeInTheDocument();
    }
  );

  it.each`
    pathname
    ${'/embed'}
    ${'/embed/widget/123'}
  `(
    'should not display anything when the path is the embed path "$pathname"',
    ({ pathname }) => {
      // Given / When
      renderCookieConsent(pathname);

      // Then
      expect(screen.queryByRole('region')).not.toBeInTheDocument();
    }
  );

  it('should open the preferences dialog when the user clicks the cookie settings button', async () => {
    // Given
    const { user } = renderCookieConsent('/app');

    // When
    await user.click(screen.getByRole('button', { name: 'CookieSettings' }));

    // Then
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
