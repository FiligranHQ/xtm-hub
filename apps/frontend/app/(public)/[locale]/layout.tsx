import { CookieSettingsLink } from '@/components/cookie-consent/CookieSettingsLink';
import Copilot from '@/components/external/Copilot';
import PublicMenu from '@/components/menu/PublicMenu';
import { PublicMobileMenuButton } from '@/components/menu/PublicMobileMenuButton';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { PublicTryFiligranProductsBanner } from '@/components/service/trial-instances/banner/PublicTryFiligranProductsBanner';
import { publicLocales, type PublicLocale } from '@/i18n/config';
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
          <div className="flex flex-col flex-1 min-h-0 min-w-0">
            <header className="max-md:sticky max-md:top-0 max-md:z-20 flex h-16 w-full shrink-0 items-center border-b border-elevation-border-strong bg-page-background dark:bg-background px-4 justify-between">
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
                    variant="outline"
                    className="whitespace-nowrap border-primary text-primary bg-primary/10">
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
            <main className="grow overflow-auto">
              <div className="container pt-l">{children}</div>
            </main>
            <footer className="container text-muted-foreground max-md:mt-xxl">
              <div className="items-center justify-between flex flex-col md:flex-row w-full px-4 py-2 gap-l text-center">
                <span className="text-xs">
                  <Link
                    href="https://filigran.io"
                    target="_blank"
                    rel="noopener noreferrer">
                    © {new Date().getFullYear()} Filigran.
                  </Link>{' '}
                  {t('PublicLayout.AllRightsReserved')}
                </span>
                <ul className="flex flex-col md:flex-row gap-l text-xs">
                  <li>
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://filigran.io/">
                      {t('PublicLayout.FiligranWebsite')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://docs.hub.filigran.io/latest/">
                      {t('PublicLayout.Documentation')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://filigran.io/privacy-policy/">
                      {t('PublicLayout.PrivacyPolicy')}
                    </Link>
                  </li>
                  <li>
                    <CookieSettingsLink />
                  </li>
                  <li>
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://filigran.io/terms-of-services/">
                      {t('PublicLayout.TermsOfServices')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://filigran.io/licenses/">
                      {t('PublicLayout.Licenses')}
                    </Link>
                  </li>
                  {!isHomePageV2Enabled && (
                    <li>
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://filigran.io/contact/">
                        {t('PublicLayout.Contact')}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </footer>
          </div>
        </div>
        <Copilot />
      </div>
    </ReactQueryProvider>
  );
};

export default RootLayout;
