export const locales = ['en', 'fr', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const publicLocales = ['en', 'ja'] as const;
export type PublicLocale = (typeof publicLocales)[number];

export const defaultLocale: PublicLocale = 'en';

export type UseTranslationsProps = (arg: string) => string;
