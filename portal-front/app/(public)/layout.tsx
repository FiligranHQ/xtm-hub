import Hubspot from '@/components/external/hubspot';
import 'filigran-ui/theme.css';
import { Metadata } from 'next';
import Head from 'next/head';
import { headers } from 'next/headers';
import Link from 'next/link';
import LogoXTMDark from '../../public/logo_xtm_hub_dark.svg';
import '../../styles/globals.css';
import { geologica, ibmPlexSans } from '../font';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  return {
    title:
      'Your Gateway to Cyber Threat Intelligence & Breach & Attack Simulation | XTM Hub',
    description:
      "XTM Hub is your gateway to Filigran's cybersecurity solutions: Cyber Threat Intelligence & Breach & Attack Simulation. Secure and optimize your defenses.",
    metadataBase: new URL(`https://${h.get('host')}`),
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
      <body className="flex flex-col min-h-screen">
        <header className="flex h-16 w-full flex-shrink-0 items-center border-b bg-page-background dark:bg-background px-4 justify-between">
          <Link href="/cybersecurity-solutions">
            <LogoXTMDark className="text-primary mr-2 w-[10rem] h-auto py-l" />
          </Link>
          <div className="flex gap-xl">
            <a
              href="https://filigran.io"
              target="_blank"
              className="uppercase inline-flex items-center justify-center rounded font-normal text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border-medium bg-transparent hover:bg-hover h-9 px-4 py-2 whitespace-nowrap"
              rel="noopener noreferrer">
              Filigran Website
            </a>
            <Link
              href="/"
              className="uppercase inline-flex items-center justify-center rounded font-normal text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/75 h-9 px-4 py-2 w-full">
              Sign In
            </Link>
          </div>
        </header>
        <div className="container">{children}</div>
        <footer className="container">
          <div className="flex items-center justify-between w-full px-4 py-8">
            <div>
              <p>© 2025 Filigran. All rights reserved</p>
            </div>
            <ul className="flex flex-row gap-l text-xs">
              <li>
                <a
                  target="_blank"
                  href="https://filigran.io/privacy-policy/">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://filigran.io/terms-of-services/">
                  Terms of Services
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://filigran.io/licenses/">
                  Licenses
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://filigran.io/contact/">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </footer>
        <Hubspot />
      </body>
    </html>
  );
}
