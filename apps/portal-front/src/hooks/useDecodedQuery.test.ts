import { renderHook } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import useDecodedQuery from './useDecodedQuery';

vi.mock('next/navigation');

describe('useDecodedQuery', () => {
  it('should decode URL-encoded query parameters', () => {
    const mockSearchParams = new URLSearchParams(
      'name=hello%20world&id=test%2Fvalue'
    );
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useDecodedQuery());

    expect(result.current).toEqual({
      name: 'hello world',
      id: 'test/value',
    });
  });

  it('should return empty object when no query params exist', () => {
    const mockSearchParams = new URLSearchParams('');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useDecodedQuery());

    expect(result.current).toEqual({});
  });

  it('should handle already-decoded query values', () => {
    const mockSearchParams = new URLSearchParams('page=1&sort=name');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useDecodedQuery());

    expect(result.current).toEqual({
      page: '1',
      sort: 'name',
    });
  });

  it('should handle special characters in encoded query params', () => {
    const mockSearchParams = new URLSearchParams(
      'q=%E4%B8%AD%E6%96%87&tag=%23test'
    );
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useDecodedQuery());

    expect(result.current).toEqual({
      q: '中文',
      tag: '#test',
    });
  });

  it('should handle multiple values for same key (last value wins)', () => {
    const mockSearchParams = new URLSearchParams('key=first&key=second');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useDecodedQuery());

    expect(result.current).toEqual({
      key: 'second',
    });
  });

  it('should not double-decode — %25 returns % without throwing URIError', () => {
    const mockSearchParams = new URLSearchParams('error=hello%25world');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useDecodedQuery());

    expect(result.current).toEqual({ error: 'hello%world' });
  });

  it('should preserve base64 = padding: %3D becomes = (ready for atob)', () => {
    const mockSearchParams = new URLSearchParams(
      'redirect=L2FwcC9tYW5hZ2UvdXNlcg%3D%3D'
    );
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useDecodedQuery());

    expect(result.current.redirect).toBe('L2FwcC9tYW5hZ2UvdXNlcg==');
    expect(atob(result.current.redirect!)).toBe('/app/manage/user');
  });

  it('should preserve base64 + char: %2B becomes + (ready for atob)', () => {
    const base64WithPlus = 'abc+def==';
    const mockSearchParams = new URLSearchParams(
      `redirect=${encodeURIComponent(base64WithPlus)}`
    );
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useDecodedQuery());

    expect(result.current.redirect).toBe('abc+def==');
  });
});
