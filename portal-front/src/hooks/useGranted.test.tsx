import useGranted from '@/hooks/useGranted';
import { OrganizationCapabilityName } from '@/utils/constant';
import { ProvidersWrapperProps, TestWrapper } from '@/utils/test/test-render';
import { renderHook } from '@testing-library/react';

describe('useGranted', () => {
  it('should return true when user has the required capability', () => {
    expect(true).toBe(true);
    const wrapper = ({ children }: ProvidersWrapperProps) => {
      return (
        <TestWrapper
          options={{
            me: {
              selected_org_capabilities: [
                OrganizationCapabilityName.MANAGE_ACCESS,
              ],
            },
          }}>
          {children}
        </TestWrapper>
      );
    };

    const { result: resultAdmin } = renderHook(
      () => useGranted(OrganizationCapabilityName.MANAGE_ACCESS),
      {
        wrapper,
      }
    );
    expect(resultAdmin.current).toBe(true);
  });

  it('should return false when user does not have the required capability', () => {
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
      () => useGranted(OrganizationCapabilityName.MANAGE_ACCESS),
      {
        wrapper,
      }
    );
    expect(resultBypass.current).toBe(false);
  });
});
