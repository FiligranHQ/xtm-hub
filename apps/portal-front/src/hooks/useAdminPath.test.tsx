import useAdminPath from '@/hooks/useAdminPath';
import { useAdminByPass } from '@/hooks/usePortalCapability';
import { APP_PATH } from '@/utils/path/constant';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import { renderHook } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

// Mocking dependencies
vi.mock('@/hooks/usePortalCapability');
vi.mock('next/navigation');
describe('useAdminPath', () => {
  it.each`
    expected | userCapa                       | path
    ${true}  | ${PortalCapabilityEnum.BYPASS} | ${'admin'}
    ${false} | ${'NOBYPASS'}                  | ${'admin'}
    ${false} | ${PortalCapabilityEnum.BYPASS} | ${'nothing'}
    ${false} | ${'NOBYPASS'}                  | ${'nothing'}
  `(
    'Should return $expected if user has $userCapa and path includes $path',
    async ({ expected, userCapa, path }) => {
      useAdminByPass.mockReturnValue(userCapa === PortalCapabilityEnum.BYPASS);
      usePathname.mockReturnValue(`/${APP_PATH}/${path}/dashboard`);

      const { result } = renderHook(() => useAdminPath());

      expect(result.current).toBe(expected);
    }
  );
});
