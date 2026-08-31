import { describe, expect, it, vi } from 'vitest';
import {
  ContentTranslationEntry,
  Locale,
} from '../../__generated__/resolvers-types';
import { ContentTranslationApp } from './content-translation.app';
import { ContentTranslationDomain } from './content-translation.domain';

describe('content-translation.app', () => {
  it('should delegate loadContentTranslationsBy to the domain with locale and keys', async () => {
    // Given
    const expected: ContentTranslationEntry[] = [
      {
        key: 'HomePage.hero.title',
        locale: Locale.En,
        value: 'Welcome',
        updated_at: new Date(),
        updater_id: null,
      },
    ];
    vi.spyOn(
      ContentTranslationDomain,
      'loadContentTranslationsBy'
    ).mockResolvedValue(expected);

    // When
    const result = await ContentTranslationApp.loadContentTranslationsBy({
      locale: Locale.En,
      keys: ['HomePage.hero.title'],
    });

    // Then
    expect(
      ContentTranslationDomain.loadContentTranslationsBy
    ).toHaveBeenCalledWith({
      locale: Locale.En,
      keys: ['HomePage.hero.title'],
    });
    expect(result).toEqual(expected);
  });

  it('should delegate upsertContentTranslationBy to the domain with the flattened input', async () => {
    // Given
    const expected: ContentTranslationEntry[] = [
      {
        key: 'HomePage.hero.title',
        locale: Locale.En,
        value: 'Updated',
        updated_at: new Date(),
        updater_id: null,
      },
    ];
    vi.spyOn(
      ContentTranslationDomain,
      'upsertContentTranslation'
    ).mockResolvedValue(expected);

    // When
    const result = await ContentTranslationApp.upsertContentTranslationBy({
      input: {
        key: 'HomePage.hero.title',
        values: [{ locale: Locale.En, value: 'Updated' }],
      },
    });

    // Then
    expect(
      ContentTranslationDomain.upsertContentTranslation
    ).toHaveBeenCalledWith('HomePage.hero.title', [
      { locale: Locale.En, value: 'Updated' },
    ]);
    expect(result).toEqual(expected);
  });
});
