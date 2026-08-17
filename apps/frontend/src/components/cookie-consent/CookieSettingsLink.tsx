'use client';

import { useConsent } from '@/components/cookie-consent/CookieConsentProvider';
import { cn } from '@/lib/utils';
import { Button } from '@filigran/ui';
import { useTranslate } from '@tolgee/react';

export const CookieSettingsLink = ({ className }: { className?: string }) => {
  const { t } = useTranslate();
  const { openPreferences } = useConsent();

  return (
    <Button
      variant="link"
      onClick={openPreferences}
      className={cn(
        'h-auto p-0 no-underline hover:no-underline cursor-pointer text-content-body-compact-link',
        className
      )}>
      {t('CookieConsent_CookieSettingsLink')}
    </Button>
  );
};
