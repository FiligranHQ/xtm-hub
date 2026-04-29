import { renderHook } from '@testing-library/react';
import { useWindowSize } from 'usehooks-ts';
import { describe, expect, it, vi } from 'vitest';
import useIsMobile from './useIsMobile';

vi.mock('usehooks-ts');

describe('useIsMobile', () => {
  it('should return true when width is below 640px', () => {
    vi.mocked(useWindowSize).mockReturnValue({ width: 320, height: 568 });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should return true when width is 639px (boundary)', () => {
    vi.mocked(useWindowSize).mockReturnValue({ width: 639, height: 800 });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should return false when width is exactly 640px', () => {
    vi.mocked(useWindowSize).mockReturnValue({ width: 640, height: 800 });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should return false when width is above 640px', () => {
    vi.mocked(useWindowSize).mockReturnValue({ width: 1024, height: 768 });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should return true when width is 0 (default)', () => {
    vi.mocked(useWindowSize).mockReturnValue({ width: 0, height: 0 });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });
});
