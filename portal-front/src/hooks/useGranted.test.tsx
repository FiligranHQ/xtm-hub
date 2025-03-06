import useGranted from '@/hooks/useGranted';
import { ORGANIZATION_CAPACITY } from '@/utils/constant';
import { ProvidersWrapperProps, TestWrapper } from '@/utils/test/test-render';
import { renderHook } from '@testing-library/react';

describe('useGranted', () => {
  it('user BYPASS should have all the rights', () => {
    expect(true).toBe(true);
    const wrapper = ({ children }: ProvidersWrapperProps) => {
      return (
        <TestWrapper
          options={{
            me: {
              selected_org_capabilities: [ORGANIZATION_CAPACITY.MANAGE_ACCESS],
            },
          }}>
          {children}
        </TestWrapper>
      );
    };

    const { result: resultAdmin } = renderHook(
      () => useGranted(ORGANIZATION_CAPACITY.MANAGE_ACCESS),
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
              selected_org_capabilities: [],
            },
          }}>
          {children}
        </TestWrapper>
      );
    };
    const { result: resultBypass } = renderHook(
      () => useGranted(ORGANIZATION_CAPACITY.MANAGE_ACCESS),
      {
        wrapper,
      }
    );
    expect(resultBypass.current).toBe(false);
  });
});
