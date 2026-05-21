'use client';

import { useLocale } from 'next-intl';
import Script from 'next/script';
import { useRef, useState } from 'react';
import { initTarteaucitron } from './tarteaucitron.config';
import './cookie-consent.css';

const CookieConsent = () => {
  const locale = useLocale();
  const [coreReady, setCoreReady] = useState(false);
  const initialized = useRef(false);

  // The cookie consent banner only mounts when explicitly enabled (= production).
  // CNIL/GDPR requirements apply to public-facing prod; dev, staging, and preview
  // environments are internal and the banner would otherwise interfere with E2E
  // tests and product validation.
  if (process.env.NEXT_PUBLIC_ENABLE_COOKIE_BANNER !== 'true') {
    return null;
  }

  const handleServicesReady = (): void => {
    if (initialized.current) return;
    initTarteaucitron(locale);
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
