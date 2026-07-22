'use client';

import { useConsent } from '@/components/cookie-consent/CookieConsentProvider';
import { cn } from '@/lib/utils';
import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';

export const CookieSettingsLink = ({ className }: { className?: string }) => {
  const t = useTranslations('CookieConsent');
  const { openPreferences } = useConsent();

  return (
    <Button
      variant="link"
      onClick={openPreferences}
      className={cn(
        'h-auto p-0 text-xs font-normal text-muted-foreground no-underline hover:no-underline cursor-pointer',
        className
      )}>
      {t('CookieSettingsLink')}
    </Button>
  );
};
