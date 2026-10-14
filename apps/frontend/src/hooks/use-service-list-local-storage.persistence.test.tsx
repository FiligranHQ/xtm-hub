import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
import { act, renderHook } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const LABEL = 'siem';
const PRIVATE_LABELS_KEY = 'labelPrivateOpenCTIIntegrationFeedsList';
const PUBLIC_LABELS_KEY = 'labelPublicOpenCTIIntegrationFeedsList';

const renderStorage = () =>
  renderHook(() =>
    useServiceListLocalStorage(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    )
  );

describe('useServiceListLocalStorage persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should restore the stored selection when it is a valid selection', () => {
    // Given
    window.localStorage.setItem(
      PRIVATE_LABELS_KEY,
      JSON.stringify({ [LABEL]: [] })
    );

    // When
    const { result } = renderStorage();

    // Then
    expect(result.current.labels).toEqual({ [LABEL]: [] });
  });

  it.each([
    ['is not valid JSON', '{not-json'],
    ['is an array', JSON.stringify([LABEL])],
    ['is null', 'null'],
    ['is a string', JSON.stringify(LABEL)],
    ['holds non string values', JSON.stringify({ [LABEL]: [1] })],
  ])(
    'should fall back to an empty selection when the stored value %s',
    (_context, storedValue) => {
      // Given
      window.localStorage.setItem(PRIVATE_LABELS_KEY, storedValue);

      // When
      const { result } = renderStorage();

      // Then
      expect(result.current.labels).toEqual({});
    }
  );

  it('should read the public storage entry when the page is a public path', () => {
    // Given
    vi.mocked(usePathname).mockReturnValue('/cybersecurity-solutions');
    window.localStorage.setItem(
      PUBLIC_LABELS_KEY,
      JSON.stringify({ [LABEL]: [] })
    );

    // When
    const { result } = renderStorage();

    // Then
    expect(result.current.labels).toEqual({ [LABEL]: [] });
  });

  it('should empty the stored selections when resetAll is called', () => {
    // Given
    const { result } = renderStorage();
    act(() => {
      result.current.setLabels({ [LABEL]: [] });
    });

    // When
    act(() => {
      result.current.resetAll();
    });

    // Then
    expect(result.current.labels).toEqual({});
  });
});
