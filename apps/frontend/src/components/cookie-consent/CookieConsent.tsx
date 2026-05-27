'use client';

import { useLocale, useTranslations } from 'next-intl';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import './cookie-consent.css';
import { initTarteaucitron } from './tarteaucitron.config';

const CookieConsent = () => {
  const locale = useLocale();
  const t = useTranslations('cookieConsent');
  const [coreReady, setCoreReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_COOKIE_BANNER !== 'true') return;

    let observer: MutationObserver | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let reapplyInterval: ReturnType<typeof setInterval> | null = null;

    const moveCopilotButton = (bannerVisible: boolean) => {
      const widget = document.querySelector('div#filigran-copilot-widget');
      const btn = widget?.shadowRoot?.querySelector(
        '.fc-btn'
      ) as HTMLElement | null;
      if (!btn) return;

      if (bannerVisible) {
        btn.style.bottom = '120px';
        btn.style.transition = 'bottom 0.3s ease';
      } else {
        btn.style.bottom = '';
        btn.style.transition = '';
      }
    };

    const checkAndMove = () => {
      const root = document.querySelector('#tarteaucitronRoot');
      const isVisible =
        root?.classList.contains('tarteaucitronBeforeVisible') ?? false;
      moveCopilotButton(isVisible);

      if (isVisible && !reapplyInterval) {
        reapplyInterval = setInterval(() => moveCopilotButton(true), 500);
      } else if (!isVisible && reapplyInterval) {
        clearInterval(reapplyInterval);
        reapplyInterval = null;
      }
    };

    pollInterval = setInterval(() => {
      const tarteRoot = document.querySelector('#tarteaucitronRoot');
      if (tarteRoot && !observer) {
        observer = new MutationObserver(checkAndMove);
        observer.observe(tarteRoot, {
          attributes: true,
          attributeFilter: ['class'],
        });
        checkAndMove();
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }
    }, 200);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (reapplyInterval) clearInterval(reapplyInterval);
      observer?.disconnect();
    };
  }, []);

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
