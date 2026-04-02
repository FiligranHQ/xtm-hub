import { PublicTryFiligranProductsBanner } from '@/components/service/trial-instances/banner/public-try-filigran-products-banner';
import { getDefaultMetadata } from '@/utils/generate-metadata';
import { Button } from '@filigran/ui/servers';
import '@filigran/ui/theme.css';
import { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';
import LogoXTMDark from '../../public/logo_xtm_hub_dark.svg';
import '../../styles/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  return await getDefaultMetadata();
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:flex md:flex-col md:h-screen">
      <PublicTryFiligranProductsBanner />
      <header className="max-md:sticky max-md:top-0 max-md:z-20 flex h-16 w-full flex-shrink-0 items-center border-b bg-page-background dark:bg-background px-4 justify-between">
        <Link href="/">
          <LogoXTMDark className="text-primary mr-2 w-[10rem] h-auto py-l" />
          <span className="sr-only">XTM Hub by Filigran</span>
        </Link>
        <Button
          asChild
          className="whitespace-nowrap">
          <Link href="/login">Sign In</Link>
        </Button>
      </header>
      <main className="flex-grow overflow-auto">
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
    </div>
  );
}
