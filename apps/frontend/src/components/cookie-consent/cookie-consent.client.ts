import {
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_DAYS,
} from '@/components/cookie-consent/cookie-consent.registry';
import {
  type ServiceConsent,
  type StoredConsent,
} from '@/components/cookie-consent/cookie-consent.types';
import {
  matchCookiePattern,
  parseStoredConsent,
  serializeConsent,
} from '@/components/cookie-consent/cookie-consent.utils';

const DAY_IN_SECONDS = 24 * 60 * 60;

const readRawCookie = (name: string): string | undefined =>
  document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);

const expireCookie = (name: string): void => {
  const base = `${name}=; path=/; max-age=0`;
  document.cookie = base;
  const parts = window.location.hostname.split('.');
  if (parts.length > 2) {
    document.cookie = `${base}; domain=.${parts.slice(-2).join('.')}`;
  }
};

export const readClientConsent = (): StoredConsent | null => {
  const raw = readRawCookie(CONSENT_COOKIE_NAME);
  return parseStoredConsent(raw ? decodeURIComponent(raw) : undefined);
};

export const writeClientConsent = (services: ServiceConsent): StoredConsent => {
  const value = serializeConsent(services);
  const attributes = [
    `${CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}`,
    'path=/',
    `max-age=${CONSENT_MAX_AGE_DAYS * DAY_IN_SECONDS}`,
    'samesite=lax',
  ];
  if (window.location.protocol === 'https:') {
    attributes.push('secure');
  }
  document.cookie = attributes.join('; ');
  return parseStoredConsent(value) as StoredConsent;
};

export const purgeCookies = (patterns: string[]): void => {
  if (patterns.length === 0) {
    return;
  }
  document.cookie
    .split('; ')
    .map((entry) => entry.split('=')[0])
    .filter((name): name is string => name !== undefined)
    .filter((name) =>
      patterns.some((pattern) => matchCookiePattern(name, pattern))
    )
    .forEach(expireCookie);
};
