import { Locale } from '@/i18n/config';

// Resolves the current static (committed) messages/{locale}.json value for a
// fully-qualified content key (e.g. "PublicHomePage.XtmPlatform.Title").
// Used by ContentEditDialog to seed every locale tab with its real current
// text before any ContentTranslation DB override is loaded — a locale that
// has never been edited has no DB row at all, so without this fallback its
// tab would show up blank instead of the text actually rendered on the
// static site.
export const getStaticTranslationValue = async (
  locale: Locale,
  key: string
): Promise<string> => {
  const messages = (await import(`../../../messages/${locale}.json`))
    .default as Record<string, unknown>;
  const value = key
    .split('.')
    .reduce<unknown>(
      (cursor, segment) =>
        cursor && typeof cursor === 'object'
          ? (cursor as Record<string, unknown>)[segment]
          : undefined,
      messages
    );
  return typeof value === 'string' ? value : '';
};
