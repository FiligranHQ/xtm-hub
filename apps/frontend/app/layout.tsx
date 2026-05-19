import AppContext from '@/components/AppContext';
import CookieConsent from '@/components/cookie-consent/CookieConsent';
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

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <I18nContext>
      <AppContext>{children}</AppContext>
      <CookieConsent />
    </I18nContext>
  );
};

export default RootLayout;