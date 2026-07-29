import Copilot from '@/components/external/Copilot';
import { AppShell } from '@/components/layout/AppShell';
import { PublicHeaderContent } from '@/components/layout/PublicHeaderContent';
import PublicMenu from '@/components/menu/PublicMenu';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { PublicTryFiligranProductsBanner } from '@/components/service/trial-instances/banner/PublicTryFiligranProductsBanner';
import { type PublicLocale, publicLocales } from '@/i18n/config';
import { getDefaultMetadata } from '@/utils/generate-metadata';
import '@filigran/ui/theme.css';
import '@styles/globals.css';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as React from 'react';

export function generateStaticParams() {
  return publicLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: PublicLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return await getDefaultMetadata(locale, '/');
}

const RootLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  if (!publicLocales.includes(locale as PublicLocale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <ReactQueryProvider>
      <AppShell
        banners={<PublicTryFiligranProductsBanner />}
        menu={<PublicMenu />}
        headerContent={<PublicHeaderContent locale={locale} />}
        contentClassName="container pt-l">
        {children}
      </AppShell>
      <Copilot />
    </ReactQueryProvider>
  );
};

export default RootLayout;
