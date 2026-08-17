import { createServerInstance } from '@tolgee/react/server';
import { getLanguage } from './language';
import { TolgeeBase } from './shared';

export const { getTolgee, getTranslate, T } = createServerInstance({
  getLocale: getLanguage,
  createTolgee: async (language) => {
    return TolgeeBase().init({
      observerOptions: { fullKeyEncode: true },
      language,
    });
  },
});
