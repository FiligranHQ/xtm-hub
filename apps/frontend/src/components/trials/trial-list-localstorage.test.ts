import {
  BUNDLE_SCOPE,
  productScope,
  TrialsScope,
  TrialsTabType,
} from '@/components/trials/trials.const';
import {
  DeploymentRequestOrdering,
  OrderingMode,
  PlatformIdentifier,
} from '@graphql/generated';
import { ColumnDef } from '@tanstack/react-table';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useTrialsListLocalstorage } from './trial-list-localstorage';

const COLUMNS: ColumnDef<unknown>[] = [
  { id: 'organization' },
  { id: 'request_date' },
  { id: 'registration_status' },
];
const DEFAULT_ORDER = DeploymentRequestOrdering.RequestDate;
const DEFAULT_ORDER_MODE = OrderingMode.Desc;
const DEFAULT_PAGE_SIZE = 50;
const CUSTOM_PAGE_SIZE = 100;
const BUNDLE_RUNNING_SUFFIX = 'bundle_running';

const renderTrialsHook = (
  type: TrialsTabType = TrialsTabType.Running,
  scope: TrialsScope = BUNDLE_SCOPE
) =>
  renderHook(() =>
    useTrialsListLocalstorage(
      COLUMNS,
      type,
      scope,
      DEFAULT_ORDER,
      DEFAULT_ORDER_MODE
    )
  );

describe('useTrialsListLocalstorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should expose the defaults given by the caller when nothing is stored', () => {
    // Given / When
    const { result } = renderTrialsHook();

    // Then
    expect(result.current.orderBy).toBe(DEFAULT_ORDER);
    expect(result.current.orderMode).toBe(DEFAULT_ORDER_MODE);
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.current.columnOrder).toEqual([
      'organization',
      'request_date',
      'registration_status',
    ]);
  });

  it('should hide the registration, platform url and platform id columns by default', () => {
    // Given / When
    const { result } = renderTrialsHook();

    // Then
    expect(result.current.columnVisibility).toEqual({
      registration_status: false,
      platform_url: false,
      platform_id: false,
    });
  });

  it('should restore the preferences stored for the same scope and tab', () => {
    // Given
    window.localStorage.setItem(
      `orderByTrialsList_${BUNDLE_RUNNING_SUFFIX}`,
      JSON.stringify(DeploymentRequestOrdering.EndDate)
    );
    window.localStorage.setItem(
      `countTrialsList_${BUNDLE_RUNNING_SUFFIX}`,
      JSON.stringify(CUSTOM_PAGE_SIZE)
    );

    // When
    const { result } = renderTrialsHook(TrialsTabType.Running, BUNDLE_SCOPE);

    // Then
    expect(result.current.orderBy).toBe(DeploymentRequestOrdering.EndDate);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
  });

  it.each([
    {
      name: 'another tab of the same scope',
      type: TrialsTabType.Expired,
      scope: BUNDLE_SCOPE,
    },
    {
      name: 'a product scope on the same tab',
      type: TrialsTabType.Running,
      scope: productScope(PlatformIdentifier.Opencti),
    },
  ])('should ignore the preferences stored for $name', ({ type, scope }) => {
    // Given
    window.localStorage.setItem(
      `countTrialsList_${BUNDLE_RUNNING_SUFFIX}`,
      JSON.stringify(CUSTOM_PAGE_SIZE)
    );

    // When
    const { result } = renderTrialsHook(type, scope);

    // Then
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it('should update the preferences when the setters are called', () => {
    // Given
    const { result } = renderTrialsHook();

    // When
    act(() => {
      result.current.setOrderMode(OrderingMode.Asc);
      result.current.setOrderBy(DeploymentRequestOrdering.Region);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
      result.current.setColumnOrder(['request_date', 'organization']);
      result.current.setColumnVisibility({ organization: false });
    });

    // Then
    expect(result.current.orderMode).toBe(OrderingMode.Asc);
    expect(result.current.orderBy).toBe(DeploymentRequestOrdering.Region);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
    expect(result.current.columnOrder).toEqual([
      'request_date',
      'organization',
    ]);
    expect(result.current.columnVisibility).toEqual({ organization: false });
  });

  it('should restore the default ordering but keep the page size when removeOrder is called', () => {
    // Given
    const { result } = renderTrialsHook();
    act(() => {
      result.current.setOrderMode(OrderingMode.Asc);
      result.current.setOrderBy(DeploymentRequestOrdering.Region);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
    });

    // When
    act(() => {
      result.current.removeOrder();
    });

    // Then
    expect(result.current.orderMode).toBe(DEFAULT_ORDER_MODE);
    expect(result.current.orderBy).toBe(DEFAULT_ORDER);
    expect(result.current.pageSize).toBe(CUSTOM_PAGE_SIZE);
  });

  it('should restore every default when resetAll is called', () => {
    // Given
    const { result } = renderTrialsHook();
    act(() => {
      result.current.setOrderMode(OrderingMode.Asc);
      result.current.setOrderBy(DeploymentRequestOrdering.Region);
      result.current.setPageSize(CUSTOM_PAGE_SIZE);
      result.current.setColumnOrder(['request_date']);
      result.current.setColumnVisibility({ organization: false });
    });

    // When
    act(() => {
      result.current.resetAll();
    });

    // Then
    expect(result.current.orderMode).toBe(DEFAULT_ORDER_MODE);
    expect(result.current.orderBy).toBe(DEFAULT_ORDER);
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.current.columnOrder).toEqual([
      'organization',
      'request_date',
      'registration_status',
    ]);
    expect(result.current.columnVisibility).toEqual({
      registration_status: false,
      platform_url: false,
      platform_id: false,
    });
  });
});
