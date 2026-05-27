import type { TarteaucitronConfig } from './types';

// TODO follow-up: extract these IDs to env vars
// (NEXT_PUBLIC_HUBSPOT_PORTAL_ID, NEXT_PUBLIC_GA_ID) for staging/prod separation
const HUBSPOT_PORTAL_ID = '26791207';
const GA_MEASUREMENT_ID = 'G-9FC0TL0TH3';

const buildConfig = (): TarteaucitronConfig => ({
  privacyUrl: 'https://filigran.io/privacy-policy/',
  hashtag: '#tarteaucitron',
  cookieName: 'xtmhub_consent',
  orientation: 'bottom',
  groupServices: true,
  showDetailsOnClick: true,
  serviceDefaultState: 'wait',
  showAlertSmall: false,
  cookieslist: false,
  showIcon: false,
  iconPosition: 'BottomRight',
  adblocker: false,
  DenyAllCta: true,
  AcceptAllCta: true,
  highPrivacy: true,
  handleBrowserDNTRequest: false,
  removeCredit: true,
  moreInfoLink: true,
  useExternalCss: false,
  readmoreLink: '/cookie-policy',
  mandatory: true,
  mandatoryCta: true,
});

const registerServices = (): void => {
  if (typeof window === 'undefined' || !window.tarteaucitron) return;

  const job = (window.tarteaucitron.job = window.tarteaucitron.job || []);

  // HubSpot (form + tracking) — replaces the Hubspot.tsx component.
  // The native tarteaucitron `hubspot` service points to js.hs-scripts.com (global),
  // which is blocked by our CSP and doesn't route to our EU portal anyway.
  // We define a custom service that points directly to the EU endpoint.
  window.tarteaucitron.services.hubspotEu = {
    key: 'hubspotEu',
    type: 'ads',
    name: 'HubSpot',
    needConsent: true,
    cookies: [
      'hubspotutk',
      '__hstc',
      '__hssrc',
      '__hssc',
      '_conv_r',
      '_conv_v',
      'hs_login_email',
    ],
    js: function () {
      const script = document.createElement('script');
      script.src = `//js-eu1.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js`;
      script.id = 'hs-script-loader';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    },
  };
  job.push('hubspotEu');

  // Google Analytics (replaces the GoogleAnalytics.tsx component).
  window.tarteaucitron.user.gtagUa = GA_MEASUREMENT_ID;
  job.push('gtag');
};

interface CookieConsentTexts {
  bannerText: string;
  acceptAll: string;
  rejectAll: string;
  cookieSettings: string;
  necessary: { title: string; description: string };
  functional: { title: string; description: string };
  analytics: { title: string; description: string };
  marketing: { title: string; description: string };
}

export const initTarteaucitron = (
  locale: string,
  texts: CookieConsentTexts
): void => {
  if (typeof window === 'undefined' || !window.tarteaucitron) return;

  window.tarteaucitronForceLanguage = locale;

  // tarteaucitronCustomText is read by tarteaucitron AFTER loading its
  // default language file, so it correctly overrides the defaults.
  // Setting window.tarteaucitron.lang directly would be overwritten.
  window.tarteaucitronCustomText = {
    alertBigPrivacy: texts.bannerText,
    acceptAll: texts.acceptAll,
    allowAll: texts.acceptAll,
    denyAll: texts.rejectAll,
    personalize: texts.cookieSettings,
    mandatoryTitle: texts.necessary.title,
    mandatoryText: texts.necessary.description,
    api: {
      title: texts.functional.title,
      details: texts.functional.description,
    },
    analytic: {
      title: texts.analytics.title,
      details: texts.analytics.description,
    },
    ads: {
      title: texts.marketing.title,
      details: texts.marketing.description,
    },
  };

  window.tarteaucitron.init(buildConfig());
  registerServices();
};