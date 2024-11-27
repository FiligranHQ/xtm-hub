import AppContext from '@/components/app-context';
import I18nContext from '@/i18n/i18n-context';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import * as React from 'react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'XTM Hub',
    description: 'XTM Hub application by Filigran',
    metadataBase: new URL(`https://${headers().get('host')}`),
  };
}

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
