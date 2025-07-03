import useGranted from '@/hooks/useGranted';
import { ProvidersWrapperProps, TestWrapper } from '@/utils/test/test-render';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
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
                OrganizationCapabilityEnum.MANAGE_ACCESS,
              ],
            },
          }}>
          {children}
        </TestWrapper>
      );
    };

    const { result: resultAdmin } = renderHook(
      () => useGranted(OrganizationCapabilityEnum.MANAGE_ACCESS),
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
      () => useGranted(OrganizationCapabilityEnum.MANAGE_ACCESS),
      {
        wrapper,
      }
    );
    expect(resultBypass.current).toBe(false);
  });
});
