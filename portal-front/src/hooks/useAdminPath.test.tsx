import useAdminByPass from '@/hooks/useAdminByPass';
import useAdminPath from '@/hooks/useAdminPath';
import { APP_PATH } from '@/utils/path/constant';
import { RestrictionEnum } from '@generated/models/Restriction.enum';
import { renderHook } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

// Mocking dependencies
vi.mock('@/hooks/useAdminByPass');
vi.mock('next/navigation');
describe('useAdminPath', () => {
  it.each`
    expected | userCapa                  | path
    ${true}  | ${RestrictionEnum.BYPASS} | ${'admin'}
    ${false} | ${'NOBYPASS'}             | ${'admin'}
    ${false} | ${RestrictionEnum.BYPASS} | ${'nothing'}
    ${false} | ${'NOBYPASS'}             | ${'nothing'}
  `(
    'Should return $expected if user has $userCapa and path includes $path',
    async ({ expected, userCapa, path }) => {
      useAdminByPass.mockReturnValue(userCapa === RestrictionEnum.BYPASS);
      usePathname.mockReturnValue(`/${APP_PATH}/${path}/dashboard`);

      const { result } = renderHook(() => useAdminPath());

      expect(result.current).toBe(expected);
    }
  );
});
