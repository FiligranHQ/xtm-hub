import { renderHook } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import useDecodedParams from './useDecodedParams';

vi.mock('next/navigation');

describe('useDecodedParams', () => {
  it('should decode URL-encoded parameter values', () => {
    vi.mocked(useParams).mockReturnValue({
      name: 'hello%20world',
      id: 'test%2Fvalue',
    });

    const { result } = renderHook(() => useDecodedParams());

    expect(result.current).toEqual({
      name: 'hello world',
      id: 'test/value',
    });
  });

  it('should return null for empty parameter values', () => {
    vi.mocked(useParams).mockReturnValue({
      name: '',
    });

    const { result } = renderHook(() => useDecodedParams());

    expect(result.current).toEqual({
      name: null,
    });
  });

  it('should return empty object when no params exist', () => {
    vi.mocked(useParams).mockReturnValue({});

    const { result } = renderHook(() => useDecodedParams());

    expect(result.current).toEqual({});
  });

  it('should handle already-decoded parameter values', () => {
    vi.mocked(useParams).mockReturnValue({
      slug: 'simple-value',
    });

    const { result } = renderHook(() => useDecodedParams());

    expect(result.current).toEqual({
      slug: 'simple-value',
    });
  });

  it('should handle special characters in encoded params', () => {
    vi.mocked(useParams).mockReturnValue({
      query: '%E4%B8%AD%E6%96%87',
      special: '%23%26%3D',
    });

    const { result } = renderHook(() => useDecodedParams());

    expect(result.current).toEqual({
      query: '中文',
      special: '#&=',
    });
  });
});
