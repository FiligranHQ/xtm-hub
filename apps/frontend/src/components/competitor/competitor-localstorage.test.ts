import { CompetitorOrdering } from '@graphql/generated';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useCompetitorListLocalstorage } from './competitor-localstorage';

const ORDER_MODE_KEY = 'orderModeCompetitorList';
const ORDER_BY_KEY = 'orderByCompetitorList';
const PAGE_SIZE_KEY = 'countCompetitorList';
const DEFAULT_PAGE_SIZE = 50;
const CUSTOM_PAGE_SIZE = 100;

describe('useCompetitorListLocalstorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should expose the default ordering and page size when nothing is stored', () => {
    // Given / When
    const { result } = renderHook(() => useCompetitorListLocalstorage());

    // Then
    expect(result.current.orderMode).toBe('asc');
    expect(result.current.orderBy).toBe(CompetitorOrdering.Tier);
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it('should restore the stored preferences when some exist', () => {
    // Given
    window.localStorage.setItem(ORDER_MODE_KEY, JSON.stringify('desc'));
    window.localStorage.setItem(
      ORDER_BY_KEY,
      JSON.stringify(CompetitorOrdering.Name)
    );
    window.localStorage.setItem(
      PAGE_SIZE_KEY,
      JSON.stringify(CUSTOM_PAGE_SIZE)
    );

    // When
    const { result } = renderHook(() => useCompetitorListLocalstorage());

    // Then
    expect(result.current.orderMode).toBe('desc');
    expect(result.current.orderBy).toBe(CompetitorOrdering.Name);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
  });

  it('should fall back to the default ordering when the stored one is not a valid ordering', () => {
    // Given
    window.localStorage.setItem(ORDER_BY_KEY, JSON.stringify('unknown_field'));

    // When
    const { result } = renderHook(() => useCompetitorListLocalstorage());

    // Then
    expect(result.current.orderBy).toBe(CompetitorOrdering.Tier);
  });

  it('should update and keep the preferences when the setters are called', () => {
    // Given
    const { result, rerender } = renderHook(() =>
      useCompetitorListLocalstorage()
    );

    // When
    act(() => {
      result.current.setOrderMode('desc');
      result.current.setOrderBy(CompetitorOrdering.Domain);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
    });
    rerender();

    // Then
    expect(result.current.orderMode).toBe('desc');
    expect(result.current.orderBy).toBe(CompetitorOrdering.Domain);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
    const remounted = renderHook(() => useCompetitorListLocalstorage());
    expect(remounted.result.current.orderBy).toBe(CompetitorOrdering.Domain);
  });

  it('should restore the default ordering but keep the page size when removeOrder is called', () => {
    // Given
    const { result } = renderHook(() => useCompetitorListLocalstorage());
    act(() => {
      result.current.setOrderMode('desc');
      result.current.setOrderBy(CompetitorOrdering.Name);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
    });

    // When
    act(() => {
      result.current.removeOrder();
    });

    // Then
    expect(result.current.orderMode).toBe('asc');
    expect(result.current.orderBy).toBe(CompetitorOrdering.Tier);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
  });

  it('should restore every default when resetAll is called', () => {
    // Given
    const { result } = renderHook(() => useCompetitorListLocalstorage());
    act(() => {
      result.current.setOrderMode('desc');
      result.current.setOrderBy(CompetitorOrdering.Name);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
    });

    // When
    act(() => {
      result.current.resetAll();
    });

    // Then
    expect(result.current.orderMode).toBe('asc');
    expect(result.current.orderBy).toBe(CompetitorOrdering.Tier);
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });
});
