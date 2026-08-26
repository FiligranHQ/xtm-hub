import {
  ContentTranslationEntry,
  MutationUpsertContentTranslationArgs,
  QueryContentTranslationsArgs,
} from '../../__generated__/resolvers-types';
import { ContentTranslationDomain } from './content-translation.domain';

export const ContentTranslationApp = {
  loadContentTranslationsBy: ({
    locale,
    keys,
  }: QueryContentTranslationsArgs): Promise<ContentTranslationEntry[]> => {
    return ContentTranslationDomain.loadContentTranslationsBy({
      locale,
      keys,
    });
  },

  upsertContentTranslationBy: (
    args: MutationUpsertContentTranslationArgs
  ): Promise<ContentTranslationEntry[]> => {
    return ContentTranslationDomain.upsertContentTranslation(
      args.input.key,
      args.input.values
    );
  },
};
