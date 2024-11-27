import AppContext from '@/components/app-context';
import I18nContext from '@/i18n/i18n-context';
import * as React from 'react';

export const metadata = {
  title: 'XTM Hub',
  description: 'XTM Hub application by Filigran',
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
