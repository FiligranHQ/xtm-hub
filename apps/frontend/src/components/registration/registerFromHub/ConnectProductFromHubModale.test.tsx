import ConnectProductFromHubModale from '@/components/registration/registerFromHub/ConnectProductFromHubModale';
import testRender from '@/utils/test/test-render';
import { PlatformIdentifier } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseGranted, mockUseConnectProductOrganizationAdminsQuery } =
  vi.hoisted(() => ({
    mockUseGranted: vi.fn(),
    mockUseConnectProductOrganizationAdminsQuery: vi.fn(),
  }));

vi.mock('@/hooks/use-granted', () => ({
  default: mockUseGranted,
}));

vi.mock('@graphql/generated', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@graphql/generated')>()),
  useConnectProductOrganizationAdminsQuery:
    mockUseConnectProductOrganizationAdminsQuery,
}));

describe('ConnectProductFromHubModale', () => {
  beforeEach(() => {
    mockUseGranted.mockReset();
    mockUseConnectProductOrganizationAdminsQuery.mockReset();
    mockUseConnectProductOrganizationAdminsQuery.mockReturnValue({
      data: {
        usersWithCapabilitiesInOrganization: [
          { email: 'admin1@example.com' },
          { email: 'admin2@example.com' },
        ],
      },
    });
    mockUseGranted.mockReturnValue(false);
  });

  it('shows denied content and lists administrators when user has no capability', () => {
    testRender(
      <ConnectProductFromHubModale
        isOpen={true}
        onOpenChange={vi.fn()}
        product={PlatformIdentifier.Opencti}
      />
    );

    expect(
      screen.getByText('Register.ConnectFromHub.PermissionRequired')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Register.ConnectFromHub.NotAllowedMessage')
    ).toBeInTheDocument();
    expect(screen.getByText('admin1@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin2@example.com')).toBeInTheDocument();
    expect(mockUseConnectProductOrganizationAdminsQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ enabled: true })
    );
  });

  it('shows allowed content when user can manage organization', () => {
    mockUseGranted.mockReturnValueOnce(true).mockReturnValueOnce(false);

    testRender(
      <ConnectProductFromHubModale
        isOpen={true}
        onOpenChange={vi.fn()}
        product={PlatformIdentifier.Opencti}
      />
    );

    expect(screen.getAllByText('allowedMessage')).toHaveLength(2);
  });

  it('disables administrators query when modal is closed', () => {
    testRender(
      <ConnectProductFromHubModale
        isOpen={false}
        onOpenChange={vi.fn()}
        product={PlatformIdentifier.Opencti}
      />
    );

    expect(mockUseConnectProductOrganizationAdminsQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ enabled: false })
    );
  });
});
