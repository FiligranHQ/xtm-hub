import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  FiligranProduct,
  OrderingMode,
  SolutionCategoryOrdering,
  useSolutionCategoriesListQuery,
} from '@graphql/generated';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSolutionCategories } from './UseSolutionCategories';

vi.mock('@graphql/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@graphql/generated')>()),
  useSolutionCategoriesListQuery: vi.fn(),
}));

describe('useSolutionCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call query with default variables when product is not provided', () => {
    vi.mocked(useSolutionCategoriesListQuery).mockReturnValue({
      data: undefined,
    } as never);

    renderHook(() => useSolutionCategories());

    expect(useSolutionCategoriesListQuery).toHaveBeenCalledWith(
      portalGraphqlClient,
      {
        count: 100,
        cursor: null,
        orderBy: SolutionCategoryOrdering.Name,
        orderMode: OrderingMode.Asc,
        product: null,
      }
    );
  });

  it('should call query with provided product filter', () => {
    vi.mocked(useSolutionCategoriesListQuery).mockReturnValue({
      data: undefined,
    } as never);

    renderHook(() => useSolutionCategories(FiligranProduct.Opencti));

    expect(useSolutionCategoriesListQuery).toHaveBeenCalledWith(
      portalGraphqlClient,
      expect.objectContaining({
        product: FiligranProduct.Opencti,
      })
    );
  });

  it('should map and format categories from query result', () => {
    vi.mocked(useSolutionCategoriesListQuery).mockReturnValue({
      data: {
        solutionCategories: {
          edges: [
            {
              node: {
                id: 'cat-1',
                name: 'threat intelligence',
              },
            },
            {
              node: {
                id: 'cat-2',
                name: ' endpoint-security ',
              },
            },
          ],
        },
      },
    } as never);

    const { result } = renderHook(() => useSolutionCategories());

    expect(result.current).toEqual([
      { id: 'cat-1', name: 'Threat Intelligence' },
      { id: 'cat-2', name: 'Endpoint-Security' },
    ]);
  });

  it('should return an empty array when query has no edges', () => {
    vi.mocked(useSolutionCategoriesListQuery).mockReturnValue({
      data: {
        solutionCategories: null,
      },
    } as never);

    const { result } = renderHook(() => useSolutionCategories());

    expect(result.current).toEqual([]);
  });
});
