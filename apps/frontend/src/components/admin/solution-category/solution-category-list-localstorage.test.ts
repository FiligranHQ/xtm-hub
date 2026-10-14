import { useSolutionCategoryListLocalstorage } from '@/components/admin/solution-category/solution-category-list-localstorage';
import { OrderingMode, SolutionCategoryOrdering } from '@graphql/generated';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

const ORDER_BY_KEY = 'orderBySolutionCategoryList';
const ORDER_MODE_KEY = 'orderModeSolutionCategoryList';
const PAGE_SIZE_KEY = 'countSolutionCategoryList';
const DEFAULT_PAGE_SIZE = 50;
const CUSTOM_PAGE_SIZE = 20;

describe('useSolutionCategoryListLocalstorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should expose the default list settings when nothing is stored', () => {
    // When
    const { result } = renderHook(() => useSolutionCategoryListLocalstorage());

    // Then
    expect(result.current).toMatchObject({
      orderBy: SolutionCategoryOrdering.Name,
      orderMode: OrderingMode.Asc,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  });

  it('should restore the stored settings when they are valid', () => {
    // Given
    window.localStorage.setItem(ORDER_MODE_KEY, JSON.stringify('desc'));
    window.localStorage.setItem(
      PAGE_SIZE_KEY,
      JSON.stringify(CUSTOM_PAGE_SIZE)
    );

    // When
    const { result } = renderHook(() => useSolutionCategoryListLocalstorage());

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Desc);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
  });

  it('should fall back to the name ordering when the stored ordering is unknown', () => {
    // Given
    window.localStorage.setItem(ORDER_BY_KEY, JSON.stringify('unknown_field'));

    // When
    const { result } = renderHook(() => useSolutionCategoryListLocalstorage());

    // Then
    expect(result.current.orderBy).toBe(SolutionCategoryOrdering.Name);
  });

  it('should update the exposed values when setters are called', () => {
    // Given
    const { result } = renderHook(() => useSolutionCategoryListLocalstorage());

    // When
    act(() => {
      result.current.setOrderMode(OrderingMode.Desc);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
    });

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Desc);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
  });

  it('should restore every default value when resetAll is called', () => {
    // Given
    const { result } = renderHook(() => useSolutionCategoryListLocalstorage());
    act(() => {
      result.current.setOrderMode(OrderingMode.Desc);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
    });

    // When
    act(() => {
      result.current.resetAll();
    });

    // Then
    expect(result.current).toMatchObject({
      orderBy: SolutionCategoryOrdering.Name,
      orderMode: OrderingMode.Asc,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  });

  it('should keep the page size when removeOrder is called', () => {
    // Given
    const { result } = renderHook(() => useSolutionCategoryListLocalstorage());
    act(() => {
      result.current.setOrderMode(OrderingMode.Desc);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
    });

    // When
    act(() => {
      result.current.removeOrder();
    });

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Asc);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
  });
});
