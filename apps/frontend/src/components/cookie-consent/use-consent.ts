import { CookieConsentContext } from '@/components/cookie-consent/CookieConsentProvider';
import { useContext } from 'react';

export const useConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within a CookieConsentProvider');
  }
  return context;
};
