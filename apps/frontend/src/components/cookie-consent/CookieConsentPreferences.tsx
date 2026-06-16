'use client';

import { CONSENT_REGISTRY } from '@/components/cookie-consent/cookie-consent.registry';
import {
  CONSENT_CATEGORIES,
  type ConsentCategory,
  type ServiceConsent,
} from '@/components/cookie-consent/cookie-consent.types';
import { useConsent } from '@/components/cookie-consent/use-consent';
import {
  acceptAllConsent,
  getAllServices,
  getDefaultConsent,
  isCategoryAllowed,
  setCategoryConsent,
} from '@/components/cookie-consent/cookie-consent.utils';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Switch,
} from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const VISIBLE_CATEGORIES = CONSENT_CATEGORIES.filter(
  (category) =>
    CONSENT_REGISTRY[category].required ||
    CONSENT_REGISTRY[category].services.length > 0
);

export const CookieConsentPreferences = () => {
  const t = useTranslations('CookieConsent');
  const { consent, isPreferencesOpen, closePreferences, save } = useConsent();
  const [draft, setDraft] = useState<ServiceConsent>(consent);
  const [openDrawers, setOpenDrawers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isPreferencesOpen) {
      setDraft(consent);
    }
  }, [isPreferencesOpen, consent]);

  const allServices = getAllServices();
  const allGranted =
    allServices.length > 0 &&
    allServices.every((service) => draft[service.id] === true);

  const setAll = (value: boolean) =>
    setDraft(value ? acceptAllConsent() : getDefaultConsent());

  const toggleCategory = (category: ConsentCategory, value: boolean) =>
    setDraft((current) => setCategoryConsent(current, category, value));

  const toggleService = (serviceId: string) =>
    setDraft((current) => ({ ...current, [serviceId]: !current[serviceId] }));

  const toggleDrawer = (category: ConsentCategory) =>
    setOpenDrawers((current) => ({
      ...current,
      [category]: !current[category],
    }));

  return (
    <Dialog
      open={isPreferencesOpen}
      onOpenChange={(open) => {
        if (!open) {
          closePreferences();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Title')}</DialogTitle>
          <DialogDescription>{t('BannerText')}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <span className="text-sm font-medium text-foreground">
            {t('PreferenceForAllServices')}
          </span>
          <Switch
            checked={allGranted}
            onCheckedChange={setAll}
            aria-label={t('PreferenceForAllServices')}
          />
        </div>

        <div className="flex flex-col gap-4">
          {VISIBLE_CATEGORIES.map((category) => {
            const { required, services } = CONSENT_REGISTRY[category];
            return (
              <div key={category} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">
                      {t(`Categories.${category}.Title`)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t(`Categories.${category}.Description`)}
                    </span>
                    {services.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => toggleDrawer(category)}
                        className="self-start text-sm text-primary underline-offset-4 hover:underline"
                      >
                        {t('ManageServices', { count: services.length })}
                      </button>
                    ) : null}
                  </div>
                  <Switch
                    checked={isCategoryAllowed(draft, category)}
                    disabled={required}
                    onCheckedChange={(value) => toggleCategory(category, value)}
                    aria-label={t(`Categories.${category}.Title`)}
                  />
                </div>

                {services.length > 0 && openDrawers[category] ? (
                  <div className="ml-4 flex flex-col gap-3 border-l border-border pl-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-start justify-between gap-4"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-foreground">
                            {service.name}
                          </span>
                          <div className="flex gap-3">
                            {service.readMoreUrl ? (
                              <a
                                href={service.readMoreUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-primary underline-offset-4 hover:underline"
                              >
                                {t('ReadMore')}
                              </a>
                            ) : null}
                            {service.officialWebsiteUrl ? (
                              <a
                                href={service.officialWebsiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-primary underline-offset-4 hover:underline"
                              >
                                {t('ViewOfficialWebsite')}
                              </a>
                            ) : null}
                          </div>
                        </div>
                        <Switch
                          checked={draft[service.id] === true}
                          disabled={required}
                          onCheckedChange={() => toggleService(service.id)}
                          aria-label={service.name}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button onClick={() => save(draft)}>{t('Save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};