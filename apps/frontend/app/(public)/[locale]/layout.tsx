import Copilot from '@/components/external/Copilot';
import { AppShell } from '@/components/layout/AppShell';
import { PublicHeaderContent } from '@/components/layout/PublicHeaderContent';
import PublicMenu from '@/components/menu/PublicMenu';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { PublicTryFiligranProductsBanner } from '@/components/service/trial-instances/banner/PublicTryFiligranProductsBanner';
import { publicLocales, type PublicLocale } from '@/i18n/config';
import { getDefaultMetadata } from '@/utils/generate-metadata';
import { isFeatureEnabled } from '@/utils/settings.service';
import '@filigran/ui/theme.css';
import { FeatureFlag } from '@graphql/generated';
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
  const isHomePageV2Enabled = await isFeatureEnabled(FeatureFlag.HomePageV2);

  if (isHomePageV2Enabled) {
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
  }

  return (
    <ReactQueryProvider>
      <div className="md:flex md:flex-col md:h-screen">
        <PublicTryFiligranProductsBanner />
        <div className="flex grow min-h-0">
          <div className="flex flex-col flex-1 min-h-0 min-w-0 bg-gradient-background">
            <header className="sticky flex h-16 w-full shrink-0 items-center border-b border-elevation-border-strong px-4 justify-between bg-gradient-background max-md:top-0 max-md:z-20">
              <PublicHeaderContent locale={locale} />
            </header>
            <main className="grow overflow-y-auto">
              <div className="container pt-l">{children}</div>
            </main>
          </div>
        </div>
        <Copilot />
      </div>
    </ReactQueryProvider>
  );
};

export default RootLayout;
