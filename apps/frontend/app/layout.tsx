import AppContext from '@/components/AppContext';
import { CookieConsentProvider } from '@/components/cookie-consent/CookieConsentProvider';
import { readServerConsent } from '@/components/cookie-consent/cookie-consent.server';
import I18nContext from '@/i18n/i18n-context';
import { getMetadataBase } from '@/utils/metadata';
import { Metadata } from 'next';
import * as React from 'react';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'XTM Hub',
    description: 'XTM Hub application by Filigran',
    metadataBase: await getMetadataBase(),
  };
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = async ({ children }: RootLayoutProps) => {
  const initialConsent = await readServerConsent();
  return (
    <I18nContext>
      <CookieConsentProvider initialConsent={initialConsent}>
        <AppContext>{children}</AppContext>
      </CookieConsentProvider>
    </I18nContext>
  );
};

export default RootLayout;