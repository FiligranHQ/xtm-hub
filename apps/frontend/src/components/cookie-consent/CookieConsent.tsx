'use client';

import { useLocale, useTranslations } from 'next-intl';
import Script from 'next/script';
import { useRef, useState } from 'react';
import './cookie-consent.css';
import { initTarteaucitron } from './tarteaucitron.config';

const CookieConsent = () => {
  const locale = useLocale();
  const t = useTranslations('cookieConsent');
  const [coreReady, setCoreReady] = useState(false);
  const initialized = useRef(false);

  if (process.env.NEXT_PUBLIC_ENABLE_COOKIE_BANNER !== 'true') {
    return null;
  }

  const handleServicesReady = (): void => {
    if (initialized.current) return;
    initTarteaucitron(locale, {
      bannerText: t('bannerText'),
      acceptAll: t('acceptAll'),
      rejectAll: t('rejectAll'),
      cookieSettings: t('cookieSettings'),
      necessary: {
        title: t('categories.necessary.title'),
        description: t('categories.necessary.description'),
      },
      functional: {
        title: t('categories.functional.title'),
        description: t('categories.functional.description'),
      },
      analytics: {
        title: t('categories.analytics.title'),
        description: t('categories.analytics.description'),
      },
      marketing: {
        title: t('categories.marketing.title'),
        description: t('categories.marketing.description'),
      },
    });
    initialized.current = true;
  };

  return (
    <>
      <Script
        src="/tarteaucitron/tarteaucitron.min.js"
        strategy="afterInteractive"
        onReady={() => setCoreReady(true)}
      />
      {coreReady && (
        <Script
          src="/tarteaucitron/tarteaucitron.services.min.js"
          strategy="afterInteractive"
          onReady={handleServicesReady}
        />
      )}
    </>
  );
};

export default CookieConsent;
