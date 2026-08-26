import { Locale } from '@/i18n/config';
import { resolveGraphqlApiEndpoint } from '@/lib/graphql-client';
import {
  ContentTranslationsByLocaleDocument,
  ContentTranslationsByLocaleQuery,
} from '@graphql/generated';

// Sets `value` on `target` at the dot-path described by `key`
// (e.g. "PublicHomePage.XtmPlatform.Title"), creating intermediate objects
// as needed. Content-translation keys are always the exact dot path of the
// static next-intl message they override, so this mirrors messages/*.json's
// own nesting.
const setNestedValue = (
  target: Record<string, unknown>,
  key: string,
  value: string
) => {
  const segments = key.split('.');
  let cursor = target;
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      cursor[segment] = value;
      return;
    }
    const next = cursor[segment];
    if (typeof next !== 'object' || next === null) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  });
};

// Server-only client with caching disabled, dedicated to this request-config
// fetch: every page render must see the latest saved content, never a
// stale cached response, since edits are expected to show up immediately
// on refresh. This intentionally does not reuse the shared
// `portalGraphqlClient` (used everywhere else via graphql-codegen), whose
// default fetch caching should stay untouched for other queries.
// A short timeout ensures a slow/unreachable backend can never hang page
// rendering — it just falls through to the static JSON fallback below,
// same as any other fetch failure.
const CONTENT_TRANSLATION_OVERRIDES_TIMEOUT_MS = 3000;

const fetchContentTranslationOverrides = async (
  locale: Locale
): Promise<Array<{ key: string; value: string }>> => {
  const response = await fetch(resolveGraphqlApiEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: ContentTranslationsByLocaleDocument,
      variables: { locale },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(CONTENT_TRANSLATION_OVERRIDES_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `Content translation overrides request failed with status ${response.status}`
    );
  }

  const { data, errors } = (await response.json()) as {
    data?: ContentTranslationsByLocaleQuery;
    errors?: unknown[];
  };

  if (errors?.length || !data?.contentTranslations) {
    throw new Error('Failed to fetch content translation overrides');
  }

  return data.contentTranslations;
};

// Overlays DB-backed content-translation overrides (edited via the
// in-context editor — useTranslate() + EditModeContentObserver)
// on top of the static next-intl JSON messages: the DB value wins for any
// key that has been migrated/edited, and the static JSON value is kept as
// the fallback for every key that hasn't (or if the overlay fetch itself
// fails/times out/errors) — so a translation-overlay outage or a
// not-yet-migrated key never breaks page rendering. Applies to every
// t()/useTranslations call — server or client, editable page or plain page.
export const withContentTranslationOverrides = async (
  locale: Locale,
  messages: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  try {
    const overrides = await fetchContentTranslationOverrides(locale);
    if (overrides.length === 0) {
      return messages;
    }
    const merged = structuredClone(messages);
    overrides.forEach(({ key, value }) => setNestedValue(merged, key, value));
    return merged;
  } catch (error) {
    console.error('Failed to load content translation overrides:', error);
    return messages;
  }
};
