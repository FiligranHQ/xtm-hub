import { FiligranProduct } from '@graphql/generated';
import { renderHook } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEpicFilter } from './use-epic-filter';

describe('useEpicFilter', () => {
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePathname).mockReturnValue('/epics');
    vi.mocked(useRouter).mockReturnValue({
      replace: mockReplace,
    } as never);
  });

  describe('selectedProduct', () => {
    it.each`
      searchQuery                             | expectedSelectedProduct    | description
      ${''}                                   | ${undefined}               | ${'no param → undefined'}
      ${'product=all'}                        | ${'all'}                   | ${'explicit "all" → "all"'}
      ${`product=${FiligranProduct.Opencti}`} | ${FiligranProduct.Opencti} | ${'valid enum value → enum'}
      ${'product=unknown'}                    | ${undefined}               | ${'unknown value → undefined'}
      ${'product='}                           | ${undefined}               | ${'empty value → undefined'}
    `(
      'should expose "$expectedSelectedProduct" from "$searchQuery" ($description)',
      ({ searchQuery, expectedSelectedProduct }) => {
        vi.mocked(useSearchParams).mockReturnValue(
          new URLSearchParams(searchQuery) as never
        );

        const { result } = renderHook(() => useEpicFilter());

        expect(result.current.selectedProduct).toBe(expectedSelectedProduct);
      }
    );
  });

  describe('setSelectedProduct', () => {
    it.each`
      initialSearch                                                              | filter                     | expectedUrl                                    | description
      ${''}                                                                      | ${'all'}                   | ${'/epics?product=all'}                        | ${'sets "all" on empty params'}
      ${''}                                                                      | ${FiligranProduct.Opencti} | ${`/epics?product=${FiligranProduct.Opencti}`} | ${'sets a product on empty params'}
      ${`product=${FiligranProduct.Opencti}`}                                    | ${FiligranProduct.Xtmhub}  | ${`/epics?product=${FiligranProduct.Xtmhub}`}  | ${'replaces existing product'}
      ${`product=${FiligranProduct.Opencti}&product=${FiligranProduct.Openaev}`} | ${FiligranProduct.Opencti} | ${`/epics?product=${FiligranProduct.Opencti}`} | ${'get first product if user plays with URL'}
    `(
      'should call router.replace with "$expectedUrl" ($description)',
      ({ initialSearch, filter, expectedUrl }) => {
        vi.mocked(useSearchParams).mockReturnValue(
          new URLSearchParams(initialSearch) as never
        );

        const { result } = renderHook(() => useEpicFilter());
        result.current.setSelectedProduct(filter);

        expect(mockReplace).toHaveBeenCalledWith(expectedUrl);
      }
    );
  });
});
