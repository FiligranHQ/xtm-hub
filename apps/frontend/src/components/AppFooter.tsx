'use client';

import { CookieSettingsLink } from '@/components/cookie-consent/CookieSettingsLink';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { cn } from '@/lib/utils';
import { FeatureFlag } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface AppFooterProps {
  className?: string;
  isHomePageV2Enabled?: boolean;
}

export const AppFooter = ({
  className,
  isHomePageV2Enabled: isHomePageV2EnabledProp,
}: AppFooterProps) => {
  const t = useTranslations('AppFooter');
  const isHomePageV2EnabledFromHook = useIsFeatureEnabled(
    FeatureFlag.HomePageV2
  );
  const isHomePageV2Enabled =
    isHomePageV2EnabledProp ?? isHomePageV2EnabledFromHook;

  return (
    <footer className={cn('container text-muted-foreground pt-6', className)}>
      <div className="items-center justify-between flex flex-col md:flex-row w-full px-4 py-2 gap-l text-center">
        <span className="text-xs">
          <Link
            href="https://filigran.io"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-70"
            suppressHydrationWarning>
            {/* eslint-disable-next-line xtm-hub-i18n-rules/no-literal-string-in-jsx */}
            © {new Date().getFullYear()} Filigran.
          </Link>{' '}
          {t('AllRightsReserved')}
        </span>
        <ul className="flex flex-col md:flex-row gap-l text-xs">
          <li>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://filigran.io/"
              className="transition-opacity hover:opacity-70">
              {t('FiligranWebsite')}
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.hub.filigran.io/latest/"
              className="transition-opacity hover:opacity-70">
              {t('Documentation')}
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://filigran.io/privacy-policy/"
              className="transition-opacity hover:opacity-70">
              {t('PrivacyPolicy')}
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
              {t('TermsOfServices')}
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://filigran.io/licenses/"
              className="transition-opacity hover:opacity-70">
              {t('Licenses')}
            </Link>
          </li>
          {!isHomePageV2Enabled && (
            <li>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://filigran.io/contact/"
                className="transition-opacity hover:opacity-70">
                {t('Contact')}
              </Link>
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
};
