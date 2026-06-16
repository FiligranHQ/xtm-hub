'use client';

import { useConsent } from '@/components/cookie-consent/use-consent';
import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

const COPILOT_HOST_SELECTOR = 'div#filigran-copilot-widget';
const COPILOT_BUTTON_SELECTOR = '.fc-btn';
const COPILOT_OFFSET = '180px';

export const CookieConsentBanner = () => {
  const t = useTranslations('CookieConsent');
  const { showBanner, acceptAll, rejectAll, openPreferences } = useConsent();

  useEffect(() => {
    if (!showBanner) {
      return;
    }

    let button: HTMLElement | null = null;
    let previousBottom = '';

    const applyOffset = () => {
      const host = document.querySelector<HTMLElement>(COPILOT_HOST_SELECTOR);
      const target = host?.shadowRoot?.querySelector<HTMLElement>(
        COPILOT_BUTTON_SELECTOR
      );
      if (!target) {
        return false;
      }
      button = target;
      previousBottom = target.style.bottom;
      target.style.bottom = COPILOT_OFFSET;
      return true;
    };

    const restore = () => {
      if (button) {
        button.style.bottom = previousBottom;
      }
    };

    if (applyOffset()) {
      return restore;
    }

    const observer = new MutationObserver(() => {
      if (applyOffset()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      restore();
    };
  }, [showBanner]);

  if (!showBanner) {
    return null;
  }

  return (
    <div
      role="region"
      aria-labelledby="cookie-consent-banner-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 shadow-lg sm:p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2
            id="cookie-consent-banner-title"
            className="text-base font-semibold text-foreground">
            {t('Title')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('BannerText')}</p>
        </div>
        <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row">
          <Button
            variant="outline"
            onClick={openPreferences}>
            {t('CookieSettings')}
          </Button>
          <Button
            variant="outline"
            onClick={rejectAll}>
            {t('RejectAll')}
          </Button>
          <Button onClick={acceptAll}>{t('AcceptAll')}</Button>
        </div>
      </div>
    </div>
  );
};
