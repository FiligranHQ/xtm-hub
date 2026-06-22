export const CONSENT_CATEGORIES = [
  'necessary',
  'functional',
  'marketing',
  'analytics',
] as const;

export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

export interface ServiceDefinition {
  id: string;
  name: string;
  cookies: string[];
  readMoreUrl?: string;
  officialWebsiteUrl?: string;
}

export interface CategoryDefinition {
  required: boolean;
  services: ServiceDefinition[];
}

export type ConsentRegistry = Record<ConsentCategory, CategoryDefinition>;

export type ServiceConsent = Record<string, boolean>;

export interface StoredConsent {
  version: number;
  timestamp: string;
  services: ServiceConsent;
}
