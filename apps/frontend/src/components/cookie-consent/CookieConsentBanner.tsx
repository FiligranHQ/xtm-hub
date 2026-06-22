'use client';

import { useConsent } from '@/components/cookie-consent/use-consent';
import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

const COPILOT_HOST_SELECTOR = 'div#filigran-copilot-widget';
const COPILOT_STYLE_ID = 'xtmhub-copilot-offset';
const COPILOT_OFFSET = '130px';
const COPILOT_POLL_MS = 300;

export const CookieConsentBanner = () => {
  const t = useTranslations('CookieConsent');
  const { showBanner, acceptAll, rejectAll, openPreferences } = useConsent();

  useEffect(() => {
    if (!showBanner) {
      return;
    }

    const ensureOffset = () => {
      const hosts = document.querySelectorAll<HTMLElement>(
        COPILOT_HOST_SELECTOR
      );
      hosts.forEach((host) => {
        const root = host.shadowRoot;
        if (!root || root.getElementById(COPILOT_STYLE_ID)) {
          return;
        }
        const style = document.createElement('style');
        style.id = COPILOT_STYLE_ID;
        style.textContent = `.fc-btn { bottom: ${COPILOT_OFFSET} !important; }`;
        root.appendChild(style);
      });
    };

    ensureOffset();
    const interval = window.setInterval(ensureOffset, COPILOT_POLL_MS);

    return () => {
      window.clearInterval(interval);
      document
        .querySelectorAll<HTMLElement>(COPILOT_HOST_SELECTOR)
        .forEach((host) => {
          host.shadowRoot?.getElementById(COPILOT_STYLE_ID)?.remove();
        });
    };
  }, [showBanner]);

  if (!showBanner) {
    return null;
  }

  return (
    <div
      role="region"
      aria-labelledby="cookie-consent-banner-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 shadow-lg sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-1 text-left">
          <h2
            id="cookie-consent-banner-title"
            className="text-base font-semibold text-foreground"
          >
            {t('Title')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('BannerText')}</p>
        </div>
        <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row">
          <Button onClick={acceptAll}>{t('AcceptAll')}</Button>
          <Button
            variant="outline"
            className="text-primary"
            onClick={rejectAll}
          >
            {t('RejectAll')}
          </Button>
          <Button
            variant="outline"
            className="text-primary"
            onClick={openPreferences}
          >
            {t('CookieSettings')}
          </Button>
        </div>
      </div>
    </div>
  );
};