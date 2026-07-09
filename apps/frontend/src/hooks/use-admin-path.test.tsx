import useAdminPath from '@/hooks/use-admin-path';
import { useAdminByPass } from '@/hooks/use-portal-capability';
import { APP_PATH } from '@/utils/path/constant';
import { PortalCapability } from '@graphql/generated';
import { renderHook } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./use-portal-capability', () => ({
  useAdminByPass: vi.fn(),
}));

describe('useAdminPath', () => {
  it.each`
    expected | userCapa                   | path
    ${true}  | ${PortalCapability.Bypass} | ${'admin'}
    ${false} | ${'NOBYPASS'}              | ${'admin'}
    ${false} | ${PortalCapability.Bypass} | ${'nothing'}
    ${false} | ${'NOBYPASS'}              | ${'nothing'}
  `(
    'Should return $expected if user has $userCapa and path includes $path',
    ({ expected, userCapa, path }) => {
      // Given
      vi.mocked(useAdminByPass).mockReturnValue(
        userCapa === PortalCapability.Bypass
      );
      vi.mocked(usePathname).mockReturnValue(`/${APP_PATH}/${path}/dashboard`);

      // When
      const { result } = renderHook(() => useAdminPath());

      // Then
      expect(result.current).toBe(expected);
    }
  );
});
