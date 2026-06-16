declare global {
  interface Window {
    tarteaucitron?: {
      init: (config: TarteaucitronConfig) => void;
      job?: string[];
      services: Record<string, TarteaucitronService>;
      user: Record<string, unknown>;
      lang: TarteaucitronLang;
      userInterface?: {
        openPanel: () => void;
      };
    };
    tarteaucitronCustomText?: TarteaucitronCustomText;
    tarteaucitronForceLanguage?: string;
  }
}

export interface TarteaucitronConfig {
  privacyUrl?: string;
  hashtag?: string;
  cookieName?: string;
  orientation?: 'top' | 'bottom' | 'middle' | 'popup';
  groupServices?: boolean;
  showDetailsOnClick?: boolean;
  serviceDefaultState?: 'true' | 'wait' | 'false';
  showAlertSmall?: boolean;
  cookieslist?: boolean;
  showIcon?: boolean;
  iconPosition?: 'BottomRight' | 'BottomLeft' | 'TopRight' | 'TopLeft';
  adblocker?: boolean;
  DenyAllCta?: boolean;
  AcceptAllCta?: boolean;
  highPrivacy?: boolean;
  handleBrowserDNTRequest?: boolean;
  removeCredit?: boolean;
  moreInfoLink?: boolean;
  useExternalCss?: boolean;
  readmoreLink?: string;
  mandatory?: boolean;
  mandatoryCta?: boolean;
}

export interface TarteaucitronService {
  key: string;
  type: 'ads' | 'analytic' | 'api' | 'comment' | 'other' | 'social' | 'support' | 'video';
  name: string;
  needConsent: boolean;
  cookies: string[];
  js: () => void;
  fallback?: () => void;
}

interface TarteaucitronCategoryLang {
  title: string;
  details: string;
}

export interface TarteaucitronLang {
  alertBigPrivacy?: string;
  acceptAll?: string;
  allowAll?: string;
  denyAll?: string;
  personalize?: string;
  mandatoryTitle?: string;
  mandatoryText?: string;
  ads?: TarteaucitronCategoryLang;
  analytic?: TarteaucitronCategoryLang;
  api?: TarteaucitronCategoryLang;
  social?: TarteaucitronCategoryLang;
  video?: TarteaucitronCategoryLang;
  comment?: TarteaucitronCategoryLang;
  support?: TarteaucitronCategoryLang;
  other?: TarteaucitronCategoryLang;
  google?: TarteaucitronCategoryLang;
  [key: string]: unknown;
}

export type TarteaucitronCustomText = Record<string, unknown>;

export {};