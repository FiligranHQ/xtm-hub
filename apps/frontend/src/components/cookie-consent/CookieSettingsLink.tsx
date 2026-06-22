'use client';

import { useConsent } from '@/components/cookie-consent/use-consent';
import { useTranslations } from 'next-intl';

export const CookieSettingsLink = () => {
  const t = useTranslations('CookieConsent');
  const { openPreferences } = useConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      className="cursor-pointer border-0 bg-transparent p-0 text-inherit">
      {t('CookieSettingsLink')}
    </button>
  );
};
