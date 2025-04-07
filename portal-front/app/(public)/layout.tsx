import GoogleAnalytics from '@/components/external/google-analytics';
import Hubspot from '@/components/external/hubspot';
import I18nContext from '@/i18n/i18n-context';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { Toaster } from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import 'filigran-ui/theme.css';
import { Metadata } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import LogoXTMDark from '../../public/logo_xtm_hub_dark.svg';
import '../../styles/globals.css';
import { geologica, ibmPlexSans } from '../font';

export async function generateMetadata(): Promise<Metadata> {
  const settingsResponse = await serverFetchGraphQL<settingsQuery>(
    SettingsQuery,
    {},
    { cache: 'force-cache' }
  );
  const baseUrl = settingsResponse.data.settings.base_url_front;
  return {
    title:
      'Your Gateway to Cyber Threat Intelligence & Breach & Attack Simulation | XTM Hub by Filigran',
    description:
      "XTM Hub is your gateway to Filigran's cybersecurity solutions: Cyber Threat Intelligence & Breach & Attack Simulation. Uncover Threats. Take Action.",
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: 'XTM Hub by Filigran - Cyber Threat Intelligence Platform',
      description:
        "XTM Hub is your gateway to Filigran's cybersecurity solutions: Cyber Threat Intelligence & Breach & Attack Simulation. Uncover Threats. Take Action.",
      url: baseUrl,
      siteName: 'XTM Hub by Filigran',
      images: [
        {
          url: `${baseUrl}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: 'XTM Hub by Filigran',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'XTM Hub by Filigran - Cyber Threat Intelligence Platform',
      description:
        "XTM Hub is your gateway to Filigran's cybersecurity solutions.",
      images: [`${baseUrl}/opengraph-image.png`],
      creator: '@FiligranHQ',
      site: '@FiligranHQ',
    },
    alternates: {
      canonical: baseUrl,
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`dark ${geologica.variable} ${ibmPlexSans.variable}`}
      style={{ colorScheme: 'dark' }}>
      <Head>
        <title>XTM Hub</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
        />
      </Head>
      <I18nContext>
        <body className="flex flex-col min-h-screen">
          <header className="flex h-16 w-full flex-shrink-0 items-center border-b bg-page-background dark:bg-background px-4 justify-between">
            <Link href="/cybersecurity-solutions">
              <LogoXTMDark className="text-primary mr-2 w-[10rem] h-auto py-l" />
              <span className="sr-only">XTM Hub by Filigran</span>
            </Link>
            <Button
              asChild
              className="whitespace-nowrap">
              <Link href="/">Sign In</Link>
            </Button>
          </header>
          <div className="container flex-grow">
            <div className="pt-l">{children}</div>
          </div>
          <footer className="container text-muted-foreground">
            <div className="items-center justify-between flex flex-col md:flex-row w-full px-4 py-8 gap-l text-center">
              <span className="txt-default">
                <Link
                  href="https://filigran.io"
                  target="_blank"
                  rel="noopener noreferrer">
                  © 2025 Filigran.
                </Link>{' '}
                All rights reserved
              </span>
              <ul className="flex flex-col md:flex-row gap-l text-xs">
                <li>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://filigran.io/">
                    Filigran website
                  </Link>
                </li>
                <li>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://filigran.io/privacy-policy/">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://filigran.io/terms-of-services/">
                    Terms of Services
                  </Link>
                </li>
                <li>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://filigran.io/licenses/">
                    Licenses
                  </Link>
                </li>
                <li>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://filigran.io/contact/">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </footer>
          <Toaster />
          <Hubspot />
          <GoogleAnalytics />
        </body>
      </I18nContext>
    </html>
  );
}
