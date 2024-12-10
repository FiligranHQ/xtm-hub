import useAdminPath from '@/hooks/useAdminPath';
import useGranted from '@/hooks/useGranted';
import { renderHook } from '@testing-library/react-hooks';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

// Mocking dependencies
vi.mock('@/hooks/useGranted');
vi.mock('next/navigation');
describe('useAdminPath', () => {
  it.each`
    expected | userCapa      | path
    ${true}  | ${'BYPASS'}   | ${'admin'}
    ${false} | ${'NOBYPASS'} | ${'admin'}
    ${false} | ${'BYPASS'}   | ${'nothing'}
    ${false} | ${'NOBYPASS'} | ${'nothing'}
  `(
    'Should return $expected if user has $userCapa and path includes $path',
    async ({ expected, userCapa, path }) => {
      useGranted.mockReturnValue(userCapa === 'BYPASS');
      usePathname.mockReturnValue(`/${path}/dashboard`);

      const { result } = renderHook(() => useAdminPath());

      expect(result.current).toBe(expected);
    }
  );
});
