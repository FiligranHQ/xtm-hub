import { OrganizationOrdering } from '@graphql/generated';
import { ColumnDef } from '@tanstack/react-table';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useOrganizationListLocalstorage } from './organization-list-localstorage';

const COLUMNS: ColumnDef<unknown>[] = [{ id: 'name' }, { id: 'members' }];
const COLUMN_IDS = ['name', 'members'];
const ORDER_MODE_KEY = 'orderModeOrganizationList';
const COUNT_KEY = 'countOrganizationList';
const COLUMN_ORDER_KEY = 'columnOrderingOrganizationList';
const COLUMN_VISIBILITY_KEY = 'columnVisibilityOrganizationList';
const DEFAULT_COUNT = 50;
const CUSTOM_COUNT = 100;

describe('useOrganizationListLocalstorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should expose the defaults when nothing is stored', () => {
    // Given / When
    const { result } = renderHook(() =>
      useOrganizationListLocalstorage(COLUMNS)
    );

    // Then
    expect(result.current.orderMode).toBe('asc');
    expect(result.current.orderBy).toBe(OrganizationOrdering.Name);
    expect(result.current.count).toBe(DEFAULT_COUNT);
    expect(result.current.pageSize).toBe(DEFAULT_COUNT);
    expect(result.current.columnOrder).toEqual(COLUMN_IDS);
    expect(result.current.columnVisibility).toEqual({});
  });

  it('should restore the stored preferences when some exist', () => {
    // Given
    window.localStorage.setItem(ORDER_MODE_KEY, JSON.stringify('desc'));
    window.localStorage.setItem(COUNT_KEY, JSON.stringify(CUSTOM_COUNT));
    window.localStorage.setItem(
      COLUMN_ORDER_KEY,
      JSON.stringify([...COLUMN_IDS].reverse())
    );
    window.localStorage.setItem(
      COLUMN_VISIBILITY_KEY,
      JSON.stringify({ members: false })
    );

    // When
    const { result } = renderHook(() =>
      useOrganizationListLocalstorage(COLUMNS)
    );

    // Then
    expect(result.current.orderMode).toBe('desc');
    expect(result.current.count).toBe(CUSTOM_COUNT);
    expect(result.current.pageSize).toBe(CUSTOM_COUNT);
    expect(result.current.columnOrder).toEqual(['members', 'name']);
    expect(result.current.columnVisibility).toEqual({ members: false });
  });

  it('should update the preferences when the setters are called', () => {
    // Given
    const { result } = renderHook(() =>
      useOrganizationListLocalstorage(COLUMNS)
    );

    // When
    act(() => {
      result.current.setOrderMode('desc');
      result.current.setCount(CUSTOM_COUNT);
      result.current.setColumnOrder(['members', 'name']);
      result.current.setColumnVisibility({ name: false });
    });

    // Then
    expect(result.current.orderMode).toBe('desc');
    expect(result.current.count).toBe(CUSTOM_COUNT);
    expect(result.current.columnOrder).toEqual(['members', 'name']);
    expect(result.current.columnVisibility).toEqual({ name: false });
  });

  it('should update the page size when setPageSize is called', () => {
    // Given
    const { result } = renderHook(() =>
      useOrganizationListLocalstorage(COLUMNS)
    );

    // When
    act(() => {
      result.current.setPageSize(CUSTOM_COUNT);
    });

    // Then
    expect(result.current.pageSize).toBe(CUSTOM_COUNT);
  });

  it('should update the ordering when setOrderBy is called', () => {
    // Given
    const { result } = renderHook(() =>
      useOrganizationListLocalstorage(COLUMNS)
    );

    // When
    act(() => {
      result.current.setOrderBy(OrganizationOrdering.Name);
    });

    // Then
    expect(result.current.orderBy).toBe(OrganizationOrdering.Name);
  });

  it('should restore the default ordering but keep the other preferences when removeOrder is called', () => {
    // Given
    const { result } = renderHook(() =>
      useOrganizationListLocalstorage(COLUMNS)
    );
    act(() => {
      result.current.setOrderMode('desc');
      result.current.setCount(CUSTOM_COUNT);
    });

    // When
    act(() => {
      result.current.removeOrder();
    });

    // Then
    expect(result.current.orderMode).toBe('asc');
    expect(result.current.orderBy).toBe(OrganizationOrdering.Name);
    expect(result.current.count).toBe(CUSTOM_COUNT);
  });

  it('should restore every default when resetAll is called', () => {
    // Given
    const { result } = renderHook(() =>
      useOrganizationListLocalstorage(COLUMNS)
    );
    act(() => {
      result.current.setOrderMode('desc');
      result.current.setCount(CUSTOM_COUNT);
      result.current.setColumnOrder(['members', 'name']);
      result.current.setColumnVisibility({ name: false });
    });

    // When
    act(() => {
      result.current.resetAll();
    });

    // Then
    expect(result.current.orderMode).toBe('asc');
    expect(result.current.orderBy).toBe(OrganizationOrdering.Name);
    expect(result.current.count).toBe(DEFAULT_COUNT);
    expect(result.current.pageSize).toBe(DEFAULT_COUNT);
    expect(result.current.columnOrder).toEqual(COLUMN_IDS);
    expect(result.current.columnVisibility).toEqual({});
  });
});
