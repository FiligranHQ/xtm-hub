import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { renderHook } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEpicFilter } from './use-epic-filter';

vi.mock('next/navigation');

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
      searchQuery                                 | expectedSelectedProduct        | description
      ${''}                                       | ${undefined}                   | ${'no param → undefined'}
      ${'product=all'}                            | ${'all'}                       | ${'explicit "all" → "all"'}
      ${`product=${FiligranProductEnum.OPENCTI}`} | ${FiligranProductEnum.OPENCTI} | ${'valid enum value → enum'}
      ${'product=unknown'}                        | ${undefined}                   | ${'unknown value → undefined'}
      ${'product='}                               | ${undefined}                   | ${'empty value → undefined'}
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
      initialSearch                                                                      | filter                         | expectedUrl                                        | description
      ${''}                                                                              | ${'all'}                       | ${'/epics?product=all'}                            | ${'sets "all" on empty params'}
      ${''}                                                                              | ${FiligranProductEnum.OPENCTI} | ${`/epics?product=${FiligranProductEnum.OPENCTI}`} | ${'sets a product on empty params'}
      ${`product=${FiligranProductEnum.OPENCTI}`}                                        | ${FiligranProductEnum.XTMHUB}  | ${`/epics?product=${FiligranProductEnum.XTMHUB}`}  | ${'replaces existing product'}
      ${`product=${FiligranProductEnum.OPENCTI}&product=${FiligranProductEnum.OPENAEV}`} | ${FiligranProductEnum.OPENCTI} | ${`/epics?product=${FiligranProductEnum.OPENCTI}`} | ${'get first product if user plays with URL'}
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
