'use client';
import { RelayProvider } from '@/relay/RelayProvider';
import { Toaster } from 'filigran-ui';
import { useLocale } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import Head from 'next/head';
import * as React from 'react';
import { geologica, ibmPlexSans } from '../../app/font';

// Component interface
interface AppProps {
  children: React.ReactNode;
}

// Component
const AppContext: React.FunctionComponent<AppProps> = ({ children }) => {
  const locale = useLocale();
  return (
    <html
      suppressHydrationWarning
      lang={locale}
      className={`${geologica.variable} ${ibmPlexSans.variable}`}>
      <Head>
        <title>Filigran Cloud Portal</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
        />
      </Head>
      <body className="flex min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange>
          <RelayProvider>{children}</RelayProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
};

// Component export
export default AppContext;
