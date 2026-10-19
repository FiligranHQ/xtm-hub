'use client';

import { CookieConsentBanner } from '@/components/cookie-consent/CookieConsentBanner';
import { CookieConsentPreferences } from '@/components/cookie-consent/CookieConsentPreferences';
import { useSelectedLayoutSegment } from 'next/navigation';

const EMBED_ROUTE_GROUP = '(embed)';

export const CookieConsent = () => {
  const segment = useSelectedLayoutSegment();
  if (segment === EMBED_ROUTE_GROUP) {
    return null;
  }
  return (
    <>
      <CookieConsentBanner />
      <CookieConsentPreferences />
    </>
  );
};
