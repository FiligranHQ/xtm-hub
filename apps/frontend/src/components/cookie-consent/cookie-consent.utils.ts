import {
  CONSENT_MAX_AGE_DAYS,
  CONSENT_REGISTRY,
  CONSENT_VERSION,
} from '@/components/cookie-consent/cookie-consent.registry';
import {
  CONSENT_CATEGORIES,
  type ConsentCategory,
  type ConsentRegistry,
  type ServiceConsent,
  type ServiceDefinition,
  type StoredConsent,
} from '@/components/cookie-consent/cookie-consent.types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const getAllServices = (
  registry: ConsentRegistry = CONSENT_REGISTRY
): ServiceDefinition[] =>
  CONSENT_CATEGORIES.flatMap((category) => registry[category].services);

export const getDefaultConsent = (
  registry: ConsentRegistry = CONSENT_REGISTRY
): ServiceConsent =>
  getAllServices(registry).reduce(
    (acc, service) => ({ ...acc, [service.id]: false }),
    {} as ServiceConsent
  );

export const acceptAllConsent = (
  registry: ConsentRegistry = CONSENT_REGISTRY
): ServiceConsent =>
  getAllServices(registry).reduce(
    (acc, service) => ({ ...acc, [service.id]: true }),
    {} as ServiceConsent
  );

export const normalizeConsent = (
  input: Partial<ServiceConsent>,
  registry: ConsentRegistry = CONSENT_REGISTRY
): ServiceConsent =>
  getAllServices(registry).reduce(
    (acc, service) => ({ ...acc, [service.id]: input[service.id] === true }),
    {} as ServiceConsent
  );

export const isServiceAllowed = (
  consent: ServiceConsent,
  serviceId: string
): boolean => consent[serviceId] === true;

export const isCategoryAllowed = (
  consent: ServiceConsent,
  category: ConsentCategory,
  registry: ConsentRegistry = CONSENT_REGISTRY
): boolean => {
  if (registry[category].required) {
    return true;
  }
  const { services } = registry[category];
  return (
    services.length > 0 &&
    services.every((service) => consent[service.id] === true)
  );
};

export const setCategoryConsent = (
  consent: ServiceConsent,
  category: ConsentCategory,
  value: boolean,
  registry: ConsentRegistry = CONSENT_REGISTRY
): ServiceConsent =>
  registry[category].services.reduce(
    (acc, service) => ({ ...acc, [service.id]: value }),
    { ...consent }
  );

export const getRevokedServices = (
  previous: ServiceConsent,
  next: ServiceConsent
): string[] => Object.keys(previous).filter((id) => previous[id] && !next[id]);

export const matchCookiePattern = (
  cookieName: string,
  pattern: string
): boolean =>
  pattern.endsWith('*')
    ? cookieName.startsWith(pattern.slice(0, -1))
    : cookieName === pattern;

export const getCookiePatternsToPurge = (
  revokedServiceIds: string[],
  registry: ConsentRegistry = CONSENT_REGISTRY
): string[] =>
  getAllServices(registry)
    .filter((service) => revokedServiceIds.includes(service.id))
    .flatMap((service) => service.cookies);

export const parseStoredConsent = (
  raw: string | null | undefined
): StoredConsent | null => {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (
      typeof parsed.version !== 'number' ||
      typeof parsed.timestamp !== 'string' ||
      typeof parsed.services !== 'object' ||
      parsed.services === null
    ) {
      return null;
    }
    return {
      version: parsed.version,
      timestamp: parsed.timestamp,
      services: normalizeConsent(parsed.services),
    };
  } catch {
    return null;
  }
};

export const serializeConsent = (
  services: ServiceConsent,
  version: number = CONSENT_VERSION,
  now: Date = new Date()
): string =>
  JSON.stringify({
    version,
    timestamp: now.toISOString(),
    services: normalizeConsent(services),
  } satisfies StoredConsent);

export const isConsentExpired = (
  stored: StoredConsent,
  now: Date = new Date(),
  maxAgeDays: number = CONSENT_MAX_AGE_DAYS
): boolean => {
  const timestamp = new Date(stored.timestamp).getTime();
  if (Number.isNaN(timestamp)) {
    return true;
  }
  return now.getTime() - timestamp > maxAgeDays * DAY_IN_MS;
};

export const needsConsent = (
  stored: StoredConsent | null,
  now: Date = new Date(),
  version: number = CONSENT_VERSION,
  maxAgeDays: number = CONSENT_MAX_AGE_DAYS
): boolean => {
  if (!stored) {
    return true;
  }
  if (stored.version !== version) {
    return true;
  }
  return isConsentExpired(stored, now, maxAgeDays);
};
