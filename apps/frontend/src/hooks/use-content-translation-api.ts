'use client';

import { Locale } from '@/i18n/config';
import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  Locale as GqlLocale,
  useContentTranslationForKeyQuery,
  useUpsertContentTranslationMutation,
} from '@graphql/generated';
import { useCallback } from 'react';

export interface EditableTranslationValue {
  locale: Locale;
  value: string;
}

// Low-level graphql-request/react-query plumbing for content_translations,
// keyed by an already fully-qualified content key (e.g.
// "HomePage.hero.title"). Used directly by ContentEditDialog. Deliberately
// does not use react-relay: this feature's data needs are simple one-off
// request/response calls, not store-backed fragments, so the app's
// existing graphql-codegen + react-query pipeline is a better fit.
export const useContentTranslationApi = () => {
  const { mutateAsync, isPending: isSaving } =
    useUpsertContentTranslationMutation(portalGraphqlClient);

  // Fetched imperatively (dialog-open time), not declaratively on mount, so
  // this calls the generated fetcher directly rather than the useQuery hook.
  const loadValuesForKey = useCallback(
    async (contentKey: string): Promise<EditableTranslationValue[]> => {
      const data = await useContentTranslationForKeyQuery.fetcher(
        portalGraphqlClient,
        { keys: [contentKey] }
      )();
      return data.contentTranslations.map(({ locale, value }) => ({
        locale: locale as Locale,
        value,
      }));
    },
    []
  );

  const saveTranslations = useCallback(
    async (
      contentKey: string,
      values: EditableTranslationValue[]
    ): Promise<void> => {
      await mutateAsync({
        input: {
          key: contentKey,
          // The app's Locale union ('en' | 'fr' | 'ja') and the generated
          // GraphQL Locale enum share the exact same underlying string
          // values, but are distinct nominal TS types — cast at the
          // boundary rather than threading the generated enum type through
          // the rest of the content-translation editing UI.
          values: values.map(({ locale, value }) => ({
            locale: locale as unknown as GqlLocale,
            value,
          })),
        },
      });
    },
    [mutateAsync]
  );

  return { loadValuesForKey, saveTranslations, isSaving };
};
