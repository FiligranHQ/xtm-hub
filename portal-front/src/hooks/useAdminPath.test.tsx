import useAdminPath from '@/hooks/useAdminPath';
import useGranted from '@/hooks/useGranted';
import { renderHook } from '@testing-library/react-hooks';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

// Mocking dependencies
vi.mock('@/hooks/useGranted');
vi.mock('next/navigation');
describe('useAdminPath', () => {
  it('should return true if user has BYPASS permission and path includes "admin"', () => {
    useGranted.mockReturnValue(true);
    usePathname.mockReturnValue('/admin/dashboard');

    const { result } = renderHook(() => useAdminPath());

    expect(result.current).toBe(true);
  });

  it('should return false if user does not have BYPASS permission, even if path includes "admin"', () => {
    useGranted.mockReturnValue(false);
    usePathname.mockReturnValue('/admin/dashboard');

    const { result } = renderHook(() => useAdminPath());

    expect(result.current).toBe(false);
  });

  it('should return false if path does not include "admin", even if user has BYPASS permission', () => {
    useGranted.mockReturnValue(true);
    usePathname.mockReturnValue('/user/profile');

    const { result } = renderHook(() => useAdminPath());

    expect(result.current).toBe(false);
  });

  it('should return false if neither condition is met', () => {
    useGranted.mockReturnValue(false);
    usePathname.mockReturnValue('/user/profile');

    const { result } = renderHook(() => useAdminPath());

    expect(result.current).toBe(false);
  });
});
