import {
  AllFilters,
  emptyFilters,
  INTEGRATION_TYPE_PARAM,
  LABEL_PARAM,
  VERIFIED_PARAM,
} from '@/components/service/integrations/[serviceInstanceId]/integration-list-url-filters.utils';
import { useIntegrationListUrlFilters } from '@/components/service/integrations/[serviceInstanceId]/use-integration-list-url-filters';
import { IntegrationType } from '@graphql/generated';
import { renderHook } from '@testing-library/react';
import { usePathname, useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const PATHNAME = '/app/service/integrations';
const LABEL = 'siem';
const OTHER_PARAM = 'tab=feeds';

const withFilters = (overrides: Partial<AllFilters>): AllFilters => ({
  ...emptyFilters(),
  ...overrides,
});

describe('useIntegrationListUrlFilters', () => {
  const replace = vi.fn();
  const resetAll = vi.fn();
  const setFilters = vi.fn();

  const renderUrlFilters = (initialFilters: AllFilters = emptyFilters()) =>
    renderHook(
      ({ filters }) =>
        useIntegrationListUrlFilters({ filters, resetAll, setFilters }),
      { initialProps: { filters: initialFilters } }
    );

  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue(PATHNAME);
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace,
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });
    window.history.replaceState({}, '', PATHNAME);
  });

  it('should replace the stored filters by the ones of the url when the page loads with filters in the url', () => {
    // Given
    window.history.replaceState(
      {},
      '',
      `${PATHNAME}?${LABEL_PARAM}=${LABEL}&${INTEGRATION_TYPE_PARAM}=${IntegrationType.Connector}`
    );

    // When
    renderUrlFilters();

    // Then
    expect(setFilters).toHaveBeenCalledWith(
      withFilters({
        [LABEL_PARAM]: { [LABEL]: [] },
        [INTEGRATION_TYPE_PARAM]: { [IntegrationType.Connector]: [] },
      })
    );
  });

  it('should reset the stored filters before applying the ones of the url', () => {
    // Given
    window.history.replaceState({}, '', `${PATHNAME}?${LABEL_PARAM}=${LABEL}`);
    const calls: string[] = [];
    resetAll.mockImplementation(() => calls.push('resetAll'));
    setFilters.mockImplementation(() => calls.push('setFilters'));

    // When
    renderUrlFilters();

    // Then
    expect(calls).toEqual(['resetAll', 'setFilters']);
  });

  it('should keep the stored filters when the url has no filter', () => {
    // Given
    window.history.replaceState({}, '', `${PATHNAME}?${OTHER_PARAM}`);

    // When
    renderUrlFilters();

    // Then
    expect(resetAll).not.toHaveBeenCalled();
    expect(setFilters).not.toHaveBeenCalled();
  });

  it('should keep the url untouched when the filters are the ones of the url', () => {
    // Given
    window.history.replaceState({}, '', `${PATHNAME}?${LABEL_PARAM}=${LABEL}`);

    // When
    renderUrlFilters(withFilters({ [LABEL_PARAM]: { [LABEL]: [] } }));

    // Then
    expect(replace).not.toHaveBeenCalled();
  });

  it('should write the filters in the url without scrolling when the filters change', () => {
    // Given
    const { rerender } = renderUrlFilters();

    // When
    rerender({
      filters: withFilters({
        [LABEL_PARAM]: { [LABEL]: [] },
        [VERIFIED_PARAM]: { true: [] },
      }),
    });

    // Then
    expect(replace).toHaveBeenCalledWith(
      `${PATHNAME}?${LABEL_PARAM}=${LABEL}&${VERIFIED_PARAM}=true`,
      { scroll: false }
    );
  });

  it('should keep the other url params when the filters change', () => {
    // Given
    window.history.replaceState({}, '', `${PATHNAME}?${OTHER_PARAM}`);
    const { rerender } = renderUrlFilters();

    // When
    rerender({ filters: withFilters({ [LABEL_PARAM]: { [LABEL]: [] } }) });

    // Then
    expect(replace).toHaveBeenCalledWith(
      `${PATHNAME}?${OTHER_PARAM}&${LABEL_PARAM}=${LABEL}`,
      { scroll: false }
    );
  });

  it('should remove the filters from the url when the filters are cleared', () => {
    // Given
    window.history.replaceState(
      {},
      '',
      `${PATHNAME}?${OTHER_PARAM}&${LABEL_PARAM}=${LABEL}`
    );
    const { rerender } = renderUrlFilters(
      withFilters({ [LABEL_PARAM]: { [LABEL]: [] } })
    );

    // When
    rerender({ filters: emptyFilters() });

    // Then
    expect(replace).toHaveBeenCalledWith(`${PATHNAME}?${OTHER_PARAM}`, {
      scroll: false,
    });
  });

  it('should navigate to the bare pathname when the last filter is cleared and no other param remains', () => {
    // Given
    window.history.replaceState({}, '', `${PATHNAME}?${LABEL_PARAM}=${LABEL}`);
    const { rerender } = renderUrlFilters(
      withFilters({ [LABEL_PARAM]: { [LABEL]: [] } })
    );

    // When
    rerender({ filters: emptyFilters() });

    // Then
    expect(replace).toHaveBeenCalledWith(PATHNAME, { scroll: false });
  });

  it('should not update the url again when rerendered with equivalent filters', () => {
    // Given
    const { rerender } = renderUrlFilters();
    rerender({ filters: withFilters({ [LABEL_PARAM]: { [LABEL]: [] } }) });
    replace.mockClear();

    // When
    rerender({ filters: withFilters({ [LABEL_PARAM]: { [LABEL]: [] } }) });

    // Then
    expect(replace).not.toHaveBeenCalled();
  });
});
