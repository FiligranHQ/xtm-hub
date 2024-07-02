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
    const { result: resultAdmin } = renderHook(
      () => useGranted('FRT_SERVICE_SUBSCRIBER'),
      {
        wrapper,
      }
    );
    expect(resultAdmin.current).toBe(true);
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
    const { result: resultAdmin } = renderHook(
      () => useGranted('FRT_SERVICE_SUBSCRIBER'),
      {
        wrapper,
      }
    );
    expect(resultAdmin.current).toBe(false);
  });

  it('user with FRT_SERVICE_SUBSCRIBER capability should only have FRT_SERVICE_SUBSCRIBER right', () => {
    expect(true).toBe(true);
    const wrapper = ({ children }: ProvidersWrapperProps) => {
      return (
        <TestWrapper
          options={{
            me: {
              capabilities: [
                {
                  name: 'FRT_SERVICE_SUBSCRIBER',
                },
              ],
            },
          }}>
          {children}
        </TestWrapper>
      );
    };
    const { result: resultBypass } = renderHook(
      () => useGranted('FRT_MANAGE_USER'),
      {
        wrapper,
      }
    );
    expect(resultBypass.current).toBe(false);
    const { result: resultAdmin } = renderHook(
      () => useGranted('FRT_SERVICE_SUBSCRIBER'),
      {
        wrapper,
      }
    );
    expect(resultAdmin.current).toBe(true);
  });
});
