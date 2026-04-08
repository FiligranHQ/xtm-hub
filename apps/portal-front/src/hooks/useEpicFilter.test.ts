import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { renderHook } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEpicFilter } from './useEpicFilter';

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

  it.each`
    searchQuery                                       | expectedSelectedProduct
    ${''}                                             | ${'all'}
    ${`product=${FiligranProductEnum.OPENCTI}`}       | ${FiligranProductEnum.OPENCTI}
    ${'product=unknown'}                              | ${'all'}
    ${'product='}                                     | ${'all'}
    ${`page=2&product=${FiligranProductEnum.XTMHUB}`} | ${FiligranProductEnum.XTMHUB}
  `(
    'should expose "$expectedSelectedProduct" from "$searchQuery"',
    ({ searchQuery, expectedSelectedProduct }) => {
      vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams(searchQuery) as never
      );

      const { result } = renderHook(() => useEpicFilter());

      expect(result.current.selectedProduct).toBe(expectedSelectedProduct);
    }
  );
});
