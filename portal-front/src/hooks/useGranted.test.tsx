import { describe, expect, it } from 'vitest';
import { ProvidersWrapperProps, TestWrapper } from '@/utils/test/test-render';
import { renderHook } from '@testing-library/react-hooks';
import useGranted from '@/hooks/useGranted';

describe('useGranted', () => {
  it('user BYPASS should have all the rights', () => {
    expect(true).toBe(true);
    const wrapper = ({ children }: ProvidersWrapperProps) => {
      return <TestWrapper>{children}</TestWrapper>;
    };
    const { result: resultBypass } = renderHook(() => useGranted('BYPASS'), {
      wrapper,
    });
    expect(resultBypass.current).toBe(true);
    const { result: resultAdmin } = renderHook(() => useGranted('ADMIN'), {
      wrapper,
    });
    expect(resultAdmin.current).toBe(true);
    const { result: resultUser } = renderHook(() => useGranted('USER'), {
      wrapper,
    });
    expect(resultUser.current).toBe(true);
  });

  it('user with no capability should not have any granted right', () => {
    expect(true).toBe(true);
    const wrapper = ({ children }: ProvidersWrapperProps) => {
      return (
        <TestWrapper
          options={{
            me: {
              capabilities: [],
            },
          }}>
          {children}
        </TestWrapper>
      );
    };
    const { result: resultBypass } = renderHook(() => useGranted('BYPASS'), {
      wrapper,
    });
    expect(resultBypass.current).toBe(false);
    const { result: resultAdmin } = renderHook(() => useGranted('ADMIN'), {
      wrapper,
    });
    expect(resultAdmin.current).toBe(false);
    const { result: resultUser } = renderHook(() => useGranted('USER'), {
      wrapper,
    });
    expect(resultUser.current).toBe(false);
  });

  it('user with ADMIN capability should only have ADMIN right', () => {
    expect(true).toBe(true);
    const wrapper = ({ children }: ProvidersWrapperProps) => {
      return (
        <TestWrapper
          options={{
            me: {
              capabilities: [
                {
                  name: 'ADMIN',
                },
              ],
            },
          }}>
          {children}
        </TestWrapper>
      );
    };
    const { result: resultBypass } = renderHook(() => useGranted('BYPASS'), {
      wrapper,
    });
    expect(resultBypass.current).toBe(false);
    const { result: resultAdmin } = renderHook(() => useGranted('ADMIN'), {
      wrapper,
    });
    expect(resultAdmin.current).toBe(true);
    const { result: resultUser } = renderHook(() => useGranted('USER'), {
      wrapper,
    });
    expect(resultUser.current).toBe(false);
  });

  it('user with USER capability should only have any USER right', () => {
    expect(true).toBe(true);
    const wrapper = ({ children }: ProvidersWrapperProps) => {
      return (
        <TestWrapper
          options={{
            me: {
              capabilities: [
                {
                  name: 'USER',
                },
              ],
            },
          }}>
          {children}
        </TestWrapper>
      );
    };
    const { result: resultBypass } = renderHook(() => useGranted('BYPASS'), {
      wrapper,
    });
    expect(resultBypass.current).toBe(false);
    const { result: resultAdmin } = renderHook(() => useGranted('ADMIN'), {
      wrapper,
    });
    expect(resultAdmin.current).toBe(false);
    const { result: resultUser } = renderHook(() => useGranted('USER'), {
      wrapper,
    });
    expect(resultUser.current).toBe(true);
  });
});
