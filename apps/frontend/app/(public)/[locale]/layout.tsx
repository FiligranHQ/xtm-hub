import CookieSettingsLink from '@/components/cookie-consent/CookieSettingsLink';
import Copilot from '@/components/external/Copilot';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { PublicTryFiligranProductsBanner } from '@/components/service/trial-instances/banner/PublicTryFiligranProductsBanner';
import { publicLocales, type PublicLocale } from '@/i18n/config';
import { getDefaultMetadata } from '@/utils/generate-metadata';
import { Button } from '@filigran/ui/servers';
import '@filigran/ui/theme.css';
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

  return (
    <ReactQueryProvider>
      <div className="md:flex md:flex-col md:h-screen">
        <PublicTryFiligranProductsBanner />
        <header className="max-md:sticky max-md:top-0 max-md:z-20 flex h-16 w-full shrink-0 items-center border-b bg-page-background dark:bg-background px-4 justify-between">
          <Link href={`/${locale}`}>
            <LogoXTMDark className="text-primary mr-2 w-[10rem] h-auto py-l" />
            <span className="sr-only">XTM Hub by Filigran</span>
          </Link>
          <Button
            asChild
            className="whitespace-nowrap">
            <Link href={`/login`}>{t('PublicLayout.SignIn')}</Link>
          </Button>
        </header>
        <main className="grow overflow-auto">
          <div className="container pt-l">{children}</div>
        </main>
        <footer className="container text-muted-foreground">
          <div className="items-center justify-between flex flex-col md:flex-row w-full px-4 py-8 gap-l text-center">
            <span className="txt-default">
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
              <li>
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://filigran.io/contact/">
                  {t('PublicLayout.Contact')}
                </Link>
              </li>
            </ul>
          </div>
        </footer>
        <Copilot />
      </div>
    </ReactQueryProvider>
  );
};

export default RootLayout;
