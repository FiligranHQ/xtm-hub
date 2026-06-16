import { CONSENT_COOKIE_NAME } from '@/components/cookie-consent/cookie-consent.registry';
import { type StoredConsent } from '@/components/cookie-consent/cookie-consent.types';
import { parseStoredConsent } from '@/components/cookie-consent/cookie-consent.utils';
import { cookies } from 'next/headers';
import 'server-only';

export const readServerConsent = async (): Promise<StoredConsent | null> => {
  const cookieStore = await cookies();
  return parseStoredConsent(cookieStore.get(CONSENT_COOKIE_NAME)?.value);
};
