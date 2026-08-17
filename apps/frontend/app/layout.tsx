import AppContext from '@/components/AppContext';
import { CookieConsentProvider } from '@/components/cookie-consent/CookieConsentProvider';
import { readServerConsent } from '@/components/cookie-consent/cookie-consent.server';
import { TolgeeNextProvider } from '@/tolgee/client';
import { getLanguage } from '@/tolgee/language';
import { getTolgee } from '@/tolgee/server';
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
  const locale = await getLanguage();
  const tolgee = await getTolgee();
  const staticData = await tolgee.loadRequired();

  return (
    <TolgeeNextProvider
      language={locale}
      staticData={staticData}>
      <CookieConsentProvider initialConsent={initialConsent}>
        <AppContext>{children}</AppContext>
      </CookieConsentProvider>
    </TolgeeNextProvider>
  );
};

export default RootLayout;
