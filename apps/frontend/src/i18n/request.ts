import type { Locale } from '@/i18n/config';
import { withContentTranslationOverrides } from '@/i18n/content-translation-overrides';
import { getUserLocale } from '@/i18n/locale';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = ((await requestLocale) ?? (await getUserLocale())) as Locale;
  const staticMessages = (await import(`../../messages/${locale}.json`))
    .default;

  return {
    locale,
    messages: await withContentTranslationOverrides(locale, staticMessages),
  };
});
