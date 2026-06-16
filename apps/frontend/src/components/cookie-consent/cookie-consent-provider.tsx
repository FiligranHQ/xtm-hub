'use client';

import {
  purgeCookies,
  writeClientConsent,
} from '@/components/cookie-consent/cookie-consent.client';
import {
  type ConsentCategory,
  type ServiceConsent,
  type StoredConsent,
} from '@/components/cookie-consent/cookie-consent.types';
import {
  acceptAllConsent,
  getCookiePatternsToPurge,
  getDefaultConsent,
  getRevokedServices,
  isCategoryAllowed,
  isServiceAllowed,
  needsConsent,
  normalizeConsent,
} from '@/components/cookie-consent/cookie-consent.utils';
import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface CookieConsentContextValue {
  consent: ServiceConsent;
  isServiceAllowed: (serviceId: string) => boolean;
  isCategoryAllowed: (category: ConsentCategory) => boolean;
  showBanner: boolean;
  isPreferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (services: ServiceConsent) => void;
}

export const CookieConsentContext =
  createContext<CookieConsentContextValue | null>(null);

interface CookieConsentProviderProps {
  initialConsent: StoredConsent | null;
  children: ReactNode;
}

export const CookieConsentProvider = ({
  initialConsent,
  children,
}: CookieConsentProviderProps) => {
  const [stored, setStored] = useState<StoredConsent | null>(initialConsent);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const consent = useMemo(
    () => (stored ? normalizeConsent(stored.services) : getDefaultConsent()),
    [stored]
  );

  const showBanner = useMemo(() => needsConsent(stored), [stored]);

  const persist = useCallback(
    (nextServices: ServiceConsent) => {
      const normalized = normalizeConsent(nextServices);
      const revoked = getRevokedServices(consent, normalized);
      purgeCookies(getCookiePatternsToPurge(revoked));
      setStored(writeClientConsent(normalized));
      setIsPreferencesOpen(false);
    },
    [consent]
  );

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      isServiceAllowed: (serviceId) => isServiceAllowed(consent, serviceId),
      isCategoryAllowed: (category) => isCategoryAllowed(consent, category),
      showBanner,
      isPreferencesOpen,
      openPreferences: () => setIsPreferencesOpen(true),
      closePreferences: () => setIsPreferencesOpen(false),
      acceptAll: () => persist(acceptAllConsent()),
      rejectAll: () => persist(getDefaultConsent()),
      save: persist,
    }),
    [consent, showBanner, isPreferencesOpen, persist]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};
