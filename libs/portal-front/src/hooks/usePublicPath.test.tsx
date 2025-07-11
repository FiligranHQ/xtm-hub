import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePathname } from 'next/navigation';
import usePublicPath from './usePublicPath';

vi.mock('next/navigation');

describe('usePublicPath', () => {
  it.each`
    expected | path
    ${true}  | ${'/cybersecurity-solutions'}
    ${true}  | ${'/cybersecurity-solutions/abc'}
    ${false} | ${'/cezfze/cybersecurity-solutions'}
    ${false} | ${'/random'}
    ${false} | ${'/cyber'}
    ${false} | ${'/something/cybersecurity-solutions'}
  `('should return $expected for pathname $path', ({ expected, path }) => {
    usePathname.mockReturnValue(path);

    const { result } = renderHook(() => usePublicPath());

    expect(result.current).toBe(expected);
  });
});
