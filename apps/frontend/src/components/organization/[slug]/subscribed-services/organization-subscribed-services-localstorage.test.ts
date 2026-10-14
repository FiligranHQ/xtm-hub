import { OrderingMode, SubscriptionOrdering } from '@graphql/generated';
import { ColumnDef } from '@tanstack/react-table';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  normalizeSubscribedServicesPageSize,
  useOrganizationSubscribedServicesLocalstorage,
} from './organization-subscribed-services-localstorage';

const COLUMNS: ColumnDef<unknown>[] = [
  { id: 'service' },
  { id: 'start_date' },
  { display: 'custom' } as unknown as ColumnDef<unknown>,
];
const COLUMN_IDS = ['service', 'start_date'];
const ORDER_MODE_KEY = 'orderModeOrganizationSubscribedServicesList';
const ORDER_BY_KEY = 'orderByOrganizationSubscribedServicesList';
const PAGE_SIZE_KEY = 'countOrganizationSubscribedServicesList';
const COLUMN_ORDER_KEY = 'columnOrderingOrganizationSubscribedServicesList';
const COLUMN_VISIBILITY_KEY =
  'columnVisibilityOrganizationSubscribedServicesList';
const DEFAULT_PAGE_SIZE = 50;
const CUSTOM_PAGE_SIZE = 200;

describe('normalizeSubscribedServicesPageSize', () => {
  it.each([
    { value: 50, expected: 50 },
    { value: 100, expected: 100 },
    { value: 200, expected: 200 },
    { value: 300, expected: 300 },
    { value: 500, expected: 500 },
    { value: 0, expected: DEFAULT_PAGE_SIZE },
    { value: 25, expected: DEFAULT_PAGE_SIZE },
    { value: 1000, expected: DEFAULT_PAGE_SIZE },
    { value: -50, expected: DEFAULT_PAGE_SIZE },
    { value: Number.NaN, expected: DEFAULT_PAGE_SIZE },
  ])(
    'should return $expected when the page size is $value',
    ({ value, expected }) => {
      // Given / When
      const result = normalizeSubscribedServicesPageSize(value);

      // Then
      expect(result).toBe(expected);
    }
  );
});

describe('useOrganizationSubscribedServicesLocalstorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should expose the defaults when nothing is stored', () => {
    // Given / When
    const { result } = renderHook(() =>
      useOrganizationSubscribedServicesLocalstorage(COLUMNS)
    );

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Asc);
    expect(result.current.orderBy).toBe(SubscriptionOrdering.StartDate);
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.current.columnVisibility).toEqual({});
  });

  it('should only order the columns that have an id when computing the default column order', () => {
    // Given / When
    const { result } = renderHook(() =>
      useOrganizationSubscribedServicesLocalstorage(COLUMNS)
    );

    // Then
    expect(result.current.columnOrder).toEqual(COLUMN_IDS);
  });

  it('should restore the stored preferences when some exist', () => {
    // Given
    window.localStorage.setItem(
      ORDER_MODE_KEY,
      JSON.stringify(OrderingMode.Desc)
    );
    window.localStorage.setItem(
      ORDER_BY_KEY,
      JSON.stringify(SubscriptionOrdering.EndDate)
    );
    window.localStorage.setItem(
      PAGE_SIZE_KEY,
      JSON.stringify(CUSTOM_PAGE_SIZE)
    );
    window.localStorage.setItem(
      COLUMN_ORDER_KEY,
      JSON.stringify([...COLUMN_IDS].reverse())
    );
    window.localStorage.setItem(
      COLUMN_VISIBILITY_KEY,
      JSON.stringify({ service: false })
    );

    // When
    const { result } = renderHook(() =>
      useOrganizationSubscribedServicesLocalstorage(COLUMNS)
    );

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Desc);
    expect(result.current.orderBy).toBe(SubscriptionOrdering.EndDate);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
    expect(result.current.columnOrder).toEqual(['start_date', 'service']);
    expect(result.current.columnVisibility).toEqual({ service: false });
  });

  it('should fall back to the default ordering when the stored one is not a valid ordering', () => {
    // Given
    window.localStorage.setItem(ORDER_BY_KEY, JSON.stringify('unknown_field'));

    // When
    const { result } = renderHook(() =>
      useOrganizationSubscribedServicesLocalstorage(COLUMNS)
    );

    // Then
    expect(result.current.orderBy).toBe(SubscriptionOrdering.StartDate);
  });

  it('should fall back to the default order mode when the stored one is not a valid mode', () => {
    // Given
    window.localStorage.setItem(ORDER_MODE_KEY, JSON.stringify('sideways'));

    // When
    const { result } = renderHook(() =>
      useOrganizationSubscribedServicesLocalstorage(COLUMNS)
    );

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Asc);
  });

  it('should fall back to the default page size when the stored one is not an allowed size', () => {
    // Given
    window.localStorage.setItem(PAGE_SIZE_KEY, JSON.stringify(25));

    // When
    const { result } = renderHook(() =>
      useOrganizationSubscribedServicesLocalstorage(COLUMNS)
    );

    // Then
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it('should update the preferences when the setters are called', () => {
    // Given
    const { result } = renderHook(() =>
      useOrganizationSubscribedServicesLocalstorage(COLUMNS)
    );

    // When
    act(() => {
      result.current.setOrderMode(OrderingMode.Desc);
      result.current.setOrderBy(SubscriptionOrdering.ServiceName);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
      result.current.setColumnOrder(['start_date', 'service']);
      result.current.setColumnVisibility({ start_date: false });
    });

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Desc);
    expect(result.current.orderBy).toBe(SubscriptionOrdering.ServiceName);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
    expect(result.current.columnOrder).toEqual(['start_date', 'service']);
    expect(result.current.columnVisibility).toEqual({ start_date: false });
  });

  it('should restore the default ordering but keep the other preferences when removeOrder is called', () => {
    // Given
    const { result } = renderHook(() =>
      useOrganizationSubscribedServicesLocalstorage(COLUMNS)
    );
    act(() => {
      result.current.setOrderMode(OrderingMode.Desc);
      result.current.setOrderBy(SubscriptionOrdering.ServiceName);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
    });

    // When
    act(() => {
      result.current.removeOrder();
    });

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Asc);
    expect(result.current.orderBy).toBe(SubscriptionOrdering.StartDate);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
  });

  it('should restore every default when resetAll is called', () => {
    // Given
    const { result } = renderHook(() =>
      useOrganizationSubscribedServicesLocalstorage(COLUMNS)
    );
    act(() => {
      result.current.setOrderMode(OrderingMode.Desc);
      result.current.setOrderBy(SubscriptionOrdering.ServiceName);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
      result.current.setColumnOrder(['start_date']);
      result.current.setColumnVisibility({ start_date: false });
    });

    // When
    act(() => {
      result.current.resetAll();
    });

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Asc);
    expect(result.current.orderBy).toBe(SubscriptionOrdering.StartDate);
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.current.columnOrder).toEqual(COLUMN_IDS);
    expect(result.current.columnVisibility).toEqual({});
  });
});
