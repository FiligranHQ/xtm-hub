'use client';

import { useConsent } from '@/components/cookie-consent/CookieConsentProvider';
import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';

export const CookieSettingsLink = () => {
  const t = useTranslations('CookieConsent');
  const { openPreferences } = useConsent();

  return (
    <Button
      variant="link"
      onClick={openPreferences}
      className="h-auto p-0 text-xs font-normal text-muted-foreground no-underline hover:no-underline cursor-pointer">
      {t('CookieSettingsLink')}
    </Button>
  );
};
