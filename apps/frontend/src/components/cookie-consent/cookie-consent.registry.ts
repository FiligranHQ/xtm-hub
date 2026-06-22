import { type ConsentRegistry } from '@/components/cookie-consent/cookie-consent.types';

export const CONSENT_COOKIE_NAME = 'xtmhub_consent';

export const CONSENT_VERSION = 1;

export const CONSENT_MAX_AGE_DAYS = 180;

export const CONSENT_REGISTRY: ConsentRegistry = {
  necessary: {
    required: true,
    services: [],
  },
  functional: {
    required: false,
    services: [],
  },
  marketing: {
    required: false,
    services: [
      {
        id: 'hubspot',
        name: 'HubSpot',
        cookies: ['__hstc', '__hssc', '__hssrc', 'hubspotutk'],
        readMoreUrl: 'https://filigran.io/privacy-policy/',
        officialWebsiteUrl: 'https://filigran.io/privacy-policy/',
      },
    ],
  },
  analytics: {
    required: false,
    services: [
      {
        id: 'google-analytics',
        name: 'Google Analytics (GA4)',
        cookies: ['_ga', '_ga_*', '_gid', '_gat', '_gat_*', '_gcl_au', '_gac_*'],
        readMoreUrl: 'https://filigran.io/privacy-policy/',
        officialWebsiteUrl: 'https://support.google.com/analytics',
      },
    ],
  },
};