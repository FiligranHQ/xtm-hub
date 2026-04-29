import I18nContext from '@/i18n/i18n-context';
import { getMetadataBase } from '@/utils/metadata';
import { Metadata } from 'next';
import * as React from 'react';
import AppContext from '@/components/AppContext';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'XTM Hub',
    description: 'XTM Hub application by Filigran',
    metadataBase: await getMetadataBase(),
  };
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nContext>
      <AppContext>{children}</AppContext>
    </I18nContext>
  );
}
