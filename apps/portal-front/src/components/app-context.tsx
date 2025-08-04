'use client';
import { Toaster } from 'filigran-ui';
import { useLocale, useTranslations } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import Head from 'next/head';
import * as React from 'react';
import { geologica, ibmPlexSans } from '../../app/font';
import Flowise from './external/flowise';
import GoogleAnalytics from './external/google-analytics';
import Hubspot from './external/hubspot';

// Component interface
interface AppProps {
  children: React.ReactNode;
}

// Component
const AppContext: React.FunctionComponent<AppProps> = ({ children }) => {
  const locale = useLocale();
  const t = useTranslations();
  return (
    <html
      suppressHydrationWarning
      lang={locale}
      className={`${geologica.variable} ${ibmPlexSans.variable}`}>
      <Head>
        <link
          rel="icon"
          href="/favicon.svg"
          type="image/svg+xml"
        />
        <title>{t('App.Title')}</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
        />
      </Head>

      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange>
          {children}
          <Toaster />
          <Hubspot />
          <GoogleAnalytics />
          <Flowise />
        </ThemeProvider>
      </body>
    </html>
  );
};

// Component export
export default AppContext;
