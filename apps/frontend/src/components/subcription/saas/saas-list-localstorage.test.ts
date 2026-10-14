import { OrderingMode, RegisteredPlatformOrdering } from '@graphql/generated';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useSaasListLocalstorage } from './saas-list-localstorage';

const ORDER_MODE_KEY = 'orderModeSaasList';
const ORDER_BY_KEY = 'orderBySaasList';
const PAGE_SIZE_KEY = 'countSaasList';
const DEFAULT_PAGE_SIZE = 50;
const CUSTOM_PAGE_SIZE = 100;

describe('useSaasListLocalstorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should expose the default ordering and page size when nothing is stored', () => {
    // Given / When
    const { result } = renderHook(() => useSaasListLocalstorage());

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Asc);
    expect(result.current.orderBy).toBe(
      RegisteredPlatformOrdering.OrganizationName
    );
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it('should restore the stored preferences when some exist', () => {
    // Given
    window.localStorage.setItem(
      ORDER_MODE_KEY,
      JSON.stringify(OrderingMode.Desc)
    );
    window.localStorage.setItem(
      PAGE_SIZE_KEY,
      JSON.stringify(CUSTOM_PAGE_SIZE)
    );

    // When
    const { result } = renderHook(() => useSaasListLocalstorage());

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Desc);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
  });

  it('should fall back to the default ordering when the stored one is not a valid ordering', () => {
    // Given
    window.localStorage.setItem(ORDER_BY_KEY, JSON.stringify('unknown_field'));

    // When
    const { result } = renderHook(() => useSaasListLocalstorage());

    // Then
    expect(result.current.orderBy).toBe(
      RegisteredPlatformOrdering.OrganizationName
    );
  });

  it('should update the preferences when the setters are called', () => {
    // Given
    const { result } = renderHook(() => useSaasListLocalstorage());

    // When
    act(() => {
      result.current.setOrderMode(OrderingMode.Desc);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
    });

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Desc);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
  });

  it('should restore the default ordering but keep the page size when removeOrder is called', () => {
    // Given
    const { result } = renderHook(() => useSaasListLocalstorage());
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

  it('should restore every default when resetAll is called', () => {
    // Given
    const { result } = renderHook(() => useSaasListLocalstorage());
    act(() => {
      result.current.setOrderMode(OrderingMode.Desc);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
    });

    // When
    act(() => {
      result.current.resetAll();
    });

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Asc);
    expect(result.current.orderBy).toBe(
      RegisteredPlatformOrdering.OrganizationName
    );
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });
});
