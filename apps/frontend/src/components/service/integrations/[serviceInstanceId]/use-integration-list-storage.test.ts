import {
  emptyFilters,
  INTEGRATION_TYPE_PARAM,
  LABEL_PARAM,
  SOLUTION_CATEGORY_PARAM,
  VERIFIED_PARAM,
} from '@/components/service/integrations/[serviceInstanceId]/integration-list-url-filters.utils';
import { useIntegrationListStorage } from '@/components/service/integrations/[serviceInstanceId]/use-integration-list-storage';
import { ServiceListLocalStorageKey } from '@/hooks/use-service-list-local-storage';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

const LABEL = 'siem';
const CATEGORY = 'ti_ops';
const STORED_LABELS_KEY = 'labelPrivateOpenCTIIntegrationFeedsList';

describe('useIntegrationListStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should expose the OpenCTI integration feeds storage key', () => {
    // When
    const { result } = renderHook(() => useIntegrationListStorage());

    // Then
    expect(result.current.localStorageKey).toBe(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    );
  });

  it('should expose empty filters when nothing is stored', () => {
    // When
    const { result } = renderHook(() => useIntegrationListStorage());

    // Then
    expect(result.current.filters).toEqual(emptyFilters());
  });

  it('should expose the stored selections as filters', () => {
    // Given
    window.localStorage.setItem(
      STORED_LABELS_KEY,
      JSON.stringify({ [LABEL]: [] })
    );

    // When
    const { result } = renderHook(() => useIntegrationListStorage());

    // Then
    expect(result.current.filters).toEqual({
      ...emptyFilters(),
      [LABEL_PARAM]: { [LABEL]: [] },
    });
  });

  it('should update the filters when setFilters is called', () => {
    // Given
    const { result } = renderHook(() => useIntegrationListStorage());

    // When
    act(() => {
      result.current.setFilters({
        ...emptyFilters(),
        [INTEGRATION_TYPE_PARAM]: { connector: [] },
        [VERIFIED_PARAM]: { true: [] },
        [SOLUTION_CATEGORY_PARAM]: { [CATEGORY]: [] },
      });
    });

    // Then
    expect(result.current.filters).toEqual({
      ...emptyFilters(),
      [INTEGRATION_TYPE_PARAM]: { connector: [] },
      [VERIFIED_PARAM]: { true: [] },
      [SOLUTION_CATEGORY_PARAM]: { [CATEGORY]: [] },
    });
  });

  it('should replace the previous selections when setFilters is called again', () => {
    // Given
    const { result } = renderHook(() => useIntegrationListStorage());
    act(() => {
      result.current.setFilters({
        ...emptyFilters(),
        [LABEL_PARAM]: { [LABEL]: [] },
      });
    });

    // When
    act(() => {
      result.current.setFilters({
        ...emptyFilters(),
        [VERIFIED_PARAM]: { true: [] },
      });
    });

    // Then
    expect(result.current.filters).toEqual({
      ...emptyFilters(),
      [VERIFIED_PARAM]: { true: [] },
    });
  });

  it('should empty the filters when resetAll is called', () => {
    // Given
    const { result } = renderHook(() => useIntegrationListStorage());
    act(() => {
      result.current.setFilters({
        ...emptyFilters(),
        [LABEL_PARAM]: { [LABEL]: [] },
      });
    });

    // When
    act(() => {
      result.current.resetAll();
    });

    // Then
    expect(result.current.filters).toEqual(emptyFilters());
  });
});
