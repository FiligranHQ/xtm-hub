'use client';

import { useConsent } from '@/components/cookie-consent/use-consent';
import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';

export const CookieSettingsLink = () => {
  const t = useTranslations('CookieConsent');
  const { openPreferences } = useConsent();
  return (
    <Button
      variant="link"
      onClick={openPreferences}>
      {t('CookieSettingsLink')}
    </Button>
  );
};
