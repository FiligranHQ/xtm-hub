import useAdminByPass from '@/hooks/useAdminByPass';
import useAdminPath from '@/hooks/useAdminPath';
import { RESTRICTION } from '@/utils/constant';
import { renderHook } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

// Mocking dependencies
vi.mock('@/hooks/useAdminByPass');
vi.mock('next/navigation');
describe('useAdminPath', () => {
  it.each`
    expected | userCapa                         | path
    ${true}  | ${RESTRICTION.CAPABILITY_BYPASS} | ${'admin'}
    ${false} | ${'NOBYPASS'}                    | ${'admin'}
    ${false} | ${RESTRICTION.CAPABILITY_BYPASS} | ${'nothing'}
    ${false} | ${'NOBYPASS'}                    | ${'nothing'}
  `(
    'Should return $expected if user has $userCapa and path includes $path',
    async ({ expected, userCapa, path }) => {
      useAdminByPass.mockReturnValue(userCapa === 'BYPASS');
      usePathname.mockReturnValue(`/${path}/dashboard`);

      const { result } = renderHook(() => useAdminPath());

      expect(result.current).toBe(expected);
    }
  );
});
