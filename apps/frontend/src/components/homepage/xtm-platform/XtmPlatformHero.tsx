'use client';

import { useTranslate } from '@/hooks/use-translate';

// Client-only island for the two editable strings in the homepage hero.
// useTranslate() marks these strings for auto-detection while edit mode is
// on (see EditModeContentObserver) — no manual wrapping needed.
export const XtmPlatformHero = () => {
  const t = useTranslate('PublicHomePage.XtmPlatform');

  return (
    <>
      <h1 className="heading-2xl">{t('Title')}</h1>
      <p className="text-muted-foreground text-xs max-w-110">
        {t('Description')}
      </p>
    </>
  );
};
