'use client';

import { useConsent } from '@/components/cookie-consent/CookieConsentProvider';
import { type ReactNode } from 'react';

interface ConsentGateProps {
  service: string;
  children: ReactNode;
}

export const ConsentGate = ({ service, children }: ConsentGateProps) => {
  const { isServiceAllowed } = useConsent();
  return isServiceAllowed(service) ? <>{children}</> : null;
};
