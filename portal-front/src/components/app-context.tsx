'use client';

import * as React from 'react';
import Head from 'next/head';
import { environment } from '@/relay/environment';
import { RelayEnvironmentProvider } from 'react-relay';
import { geologica, ibmPlexSans } from '../../app/font';

// Component interface
interface AppProps {
  children: React.ReactNode;
}

// Component
const AppContext: React.FunctionComponent<AppProps> = ({ children }) => {
  return (
    <html lang='en' className={`${geologica.variable} ${ibmPlexSans.variable}`}>
    <Head>
      <title>Filigran Cloud Portal</title>
      <meta
        name='viewport'
        content='initial-scale=1.0, width=device-width'
      />
    </Head>
    <body>
    {/** @ts-ignore */}
    <RelayEnvironmentProvider environment={environment}>
      <>{children}</>
    </RelayEnvironmentProvider>
    </body>
    </html>
  );
};

// Component export
export default AppContext;
