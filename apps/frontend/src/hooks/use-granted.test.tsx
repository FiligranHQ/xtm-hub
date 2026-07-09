import useGranted from '@/hooks/use-granted';
import { ProvidersWrapperProps, TestWrapper } from '@/utils/test/test-render';
import { OrganizationCapability } from '@graphql/generated';
import { renderHook } from '@testing-library/react';

describe('useGranted', () => {
  it('should return true when user has the required capability', () => {
    expect(true).toBe(true);
    const wrapper = ({ children }: ProvidersWrapperProps) => {
      return (
        <TestWrapper
          options={{
            me: {
              selected_org_capabilities: [OrganizationCapability.ManageAccess],
            },
          }}>
          {children}
        </TestWrapper>
      );
    };

    const { result: resultAdmin } = renderHook(
      () => useGranted(OrganizationCapability.ManageAccess),
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
      () => useGranted(OrganizationCapability.ManageAccess),
      {
        wrapper,
      }
    );
    expect(resultBypass.current).toBe(false);
  });
});
