'use client';

import { CookieSettingsLink } from '@/components/cookie-consent/CookieSettingsLink';
import { cn } from '@/lib/utils';
import { useTranslate } from '@tolgee/react';
import Link from 'next/link';

interface AppFooterProps {
  className?: string;
}

export const AppFooter = ({ className }: AppFooterProps) => {
  const { t } = useTranslate();

  return (
    <footer
      className={cn(
        'text-text-default-primary content-body-compact bg-elevation-bg-layer-0 pt-6 px-0',
        className
      )}>
      <div className="items-center justify-between flex flex-col md:flex-row w-full px-4 py-2 gap-l text-center">
        <span className="text-content-body-compact-link">
          <Link
            href="https://filigran.io"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-70"
            suppressHydrationWarning>
            {/* eslint-disable-next-line xtm-hub-i18n-rules/no-literal-string-in-jsx */}
            © {new Date().getFullYear()} Filigran.
          </Link>{' '}
          {t('AppFooter_AllRightsReserved')}
        </span>
        <ul className="flex flex-col md:flex-row gap-l text-content-body-compact-link">
          <li>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://filigran.io/"
              className="transition-opacity hover:opacity-70">
              {t('AppFooter_FiligranWebsite')}
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.hub.filigran.io/latest/"
              className="transition-opacity hover:opacity-70">
              {t('AppFooter_Documentation')}
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://filigran.io/privacy-policy/"
              className="transition-opacity hover:opacity-70">
              {t('AppFooter_PrivacyPolicy')}
            </Link>
          </li>
          <li>
            <CookieSettingsLink className="transition-opacity hover:opacity-70" />
          </li>
          <li>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://filigran.io/terms-of-services/"
              className="transition-opacity hover:opacity-70">
              {t('AppFooter_TermsOfServices')}
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://filigran.io/licenses/"
              className="transition-opacity hover:opacity-70">
              {t('AppFooter_Licenses')}
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};
