'use client';

import { CookieConsentBanner } from '@/components/cookie-consent/CookieConsentBanner';
import { CookieConsentPreferences } from '@/components/cookie-consent/CookieConsentPreferences';
import { usePathname } from 'next/navigation';

const EMBED_PATH_PREFIXES = ['/embed'];

export const CookieConsent = () => {
  const pathname = usePathname();
  if (EMBED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }
  return (
    <>
      <CookieConsentBanner />
      <CookieConsentPreferences />
    </>
  );
};