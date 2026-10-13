'use client';

import { CookieSettingsLink } from '@/components/cookie-consent/CookieSettingsLink';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import {
  FiligranWebsiteUtmCampaign,
  withFiligranWebsiteUtm,
} from '@/utils/filigran-website-utm';
import Link from 'next/link';

const footerUtm = (content: string) => ({
  campaign: FiligranWebsiteUtmCampaign.FOOTER,
  content,
});

const FOOTER_LINKS = {
  copyright: withFiligranWebsiteUtm(
    'https://filigran.io/',
    footerUtm('copyright')
  ),
  filigranWebsite: withFiligranWebsiteUtm(
    'https://filigran.io/',
    footerUtm('filigran_website')
  ),
  privacyPolicy: withFiligranWebsiteUtm(
    'https://filigran.io/privacy-policy',
    footerUtm('privacy_policy')
  ),
  termsOfService: withFiligranWebsiteUtm(
    'https://filigran.io/mssa',
    footerUtm('terms_of_service')
  ),
  licenses: withFiligranWebsiteUtm(
    'https://filigran.io/licenses',
    footerUtm('licenses')
  ),
};

interface AppFooterProps {
  className?: string;
}

export const AppFooter = ({ className }: AppFooterProps) => {
  const t = useTranslate('AppFooter');

  return (
    <footer
      className={cn(
        'text-text-default-primary content-body-compact bg-elevation-bg-layer-0 pt-6 px-0',
        className
      )}>
      <div className="items-center justify-between flex flex-col md:flex-row w-full px-4 py-2 gap-l text-center">
        <span className="text-content-body-compact-link">
          <Link
            href={FOOTER_LINKS.copyright}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-70"
            suppressHydrationWarning>
            {/* eslint-disable-next-line xtm-hub-i18n-rules/no-literal-string-in-jsx */}
            © {new Date().getFullYear()} Filigran.
          </Link>{' '}
          {t('AllRightsReserved')}
        </span>
        <ul className="flex flex-col md:flex-row gap-l text-content-body-compact-link">
          <li>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={FOOTER_LINKS.filigranWebsite}
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
              href={FOOTER_LINKS.privacyPolicy}
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
              href={FOOTER_LINKS.termsOfService}
              className="transition-opacity hover:opacity-70">
              {t('TermsOfService')}
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={FOOTER_LINKS.licenses}
              className="transition-opacity hover:opacity-70">
              {t('Licenses')}
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};
