'use client';
import * as React from 'react';
import Head from 'next/head';
import { geologica, ibmPlexSans } from '../../app/font';
import { RelayProvider } from '@/relay/RelayProvider';
import { Toaster } from 'filigran-ui';
import { ThemeProvider } from 'next-themes';

// Component interface
interface AppProps {
  children: React.ReactNode;
}

// Component
const AppContext: React.FunctionComponent<AppProps> = ({ children }) => {
  return (
    <html
      lang="en"
      className={`${geologica.variable} ${ibmPlexSans.variable}`}>
      <Head>
        <title>Filigran Cloud Portal</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
        />
      </Head>
      <body className="flex min-h-screen flex-col">
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
