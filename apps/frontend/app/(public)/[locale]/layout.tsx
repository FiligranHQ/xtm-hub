import { AppFooter } from '@/components/AppFooter';
import Copilot from '@/components/external/Copilot';
import { PublicMobileMenuButton } from '@/components/menu/navigation/public/PublicMobileMenuButton';
import PublicMenu from '@/components/menu/PublicMenu';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { PublicTryFiligranProductsBanner } from '@/components/service/trial-instances/banner/PublicTryFiligranProductsBanner';
import { publicLocales, type PublicLocale } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { getDefaultMetadata } from '@/utils/generate-metadata';
import { isFeatureEnabled } from '@/utils/settings.service';
import { Button } from '@filigran/ui/servers';
import '@filigran/ui/theme.css';
import { FeatureFlag } from '@graphql/generated';
import LogoXTMDark from '@public/logo_xtm_hub_dark.svg';
import '@styles/globals.css';
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
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
  const t = await getTranslations();
  const isHomePageV2Enabled = await isFeatureEnabled(FeatureFlag.HomePageV2);

  return (
    <ReactQueryProvider>
      <div className="md:flex md:flex-col md:h-screen">
        <PublicTryFiligranProductsBanner />
        <div className="flex grow min-h-0">
          {isHomePageV2Enabled && <PublicMenu />}
          <div
            className={cn(
              'flex flex-col flex-1 min-h-0 min-w-0',
              !isHomePageV2Enabled && 'bg-gradient-background',
              isHomePageV2Enabled && 'md:overflow-y-auto'
            )}>
            <header
              className={cn(
                'sticky flex h-16 w-full shrink-0 items-center border-b border-elevation-border-strong px-4 justify-between',
                isHomePageV2Enabled &&
                  "backdrop-blur-sm top-0 z-20 before:content-[''] before:absolute before:inset-0 before:bg-gradient-background before:opacity-50 before:-z-1",
                !isHomePageV2Enabled &&
                  'bg-gradient-background max-md:top-0 max-md:z-20'
              )}>
              <Link
                href={`/${locale}`}
                className={isHomePageV2Enabled ? 'md:hidden' : undefined}>
                <LogoXTMDark className="text-primary mr-2 h-8 w-auto" />
                <span className="sr-only">XTM Hub by Filigran</span>
              </Link>
              {isHomePageV2Enabled ? (
                <div className="flex items-center gap-s ml-auto">
                  <Button
                    asChild
                    variant="outline-primary"
                    className="whitespace-nowrap border-elevation-border-strong">
                    <Link href="/auth/oidc">{t('PublicLayout.Login')}</Link>
                  </Button>
                  <Button
                    asChild
                    className="whitespace-nowrap">
                    <Link href={`/sign-up`}>{t('PublicLayout.SignUp')}</Link>
                  </Button>
                  <div className="md:hidden flex items-center">
                    <PublicMobileMenuButton />
                  </div>
                </div>
              ) : (
                <Button
                  asChild
                  className="whitespace-nowrap">
                  <Link href={`/login`}>{t('PublicLayout.SignIn')}</Link>
                </Button>
              )}
            </header>
            <main
              className={cn('grow', !isHomePageV2Enabled && 'overflow-y-auto')}>
              <div
                className={cn(
                  'container pt-l',
                  isHomePageV2Enabled && 'pt-xxl'
                )}>
                {children}
              </div>
            </main>
            <AppFooter
              className="max-md:mt-xxl px-6"
              isHomePageV2Enabled={isHomePageV2Enabled}
            />
          </div>
        </div>
        <Copilot />
      </div>
    </ReactQueryProvider>
  );
};

export default RootLayout;
