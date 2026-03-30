import { RegistrationDetails } from '@/components/service/registration/registration-details';
import testRender from '@/utils/test/test-render';
import { DeploymentRequestHubStatusEnum } from '@generated/models/DeploymentRequestHubStatus.enum';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it, vi } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUseSearchParams = vi.fn(() => new URLSearchParams());

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams(),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('next-intl', async (importOriginal) => ({
  ...(await importOriginal()),
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/service/components/platform-update-sheet', () => ({
  PlatformUpdateSheet: () => null,
}));

vi.mock('@/components/service/trial-instances/trial-cancel-sheet', () => ({
  TrialCancelSheet: () => null,
}));

vi.mock('@/components/service/registration/unregister-button', () => ({
  UnregisterButton: () => null,
}));

vi.mock(
  '@/components/service/trial-instances/manage-users/trials-manage-users-dialog',
  () => ({
    TrialsManageUsersDialog: ({
      defaultOpen,
    }: {
      serviceInstanceId: string;
      organizationId?: string;
      defaultOpen?: boolean;
    }) => (
      <div
        data-testid="manage-users-dialog"
        data-default-open={String(defaultOpen)}>
        ManageUsersDialog
      </div>
    ),
  })
);

let mockPlatformData: registeredPlatformByServiceInstanceId_fragment$data;

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal()),
  useFragment: () => mockPlatformData,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const basePlatform: registeredPlatformByServiceInstanceId_fragment$data = {
  ' $fragmentType': 'registeredPlatformByServiceInstanceId_fragment',
  id: 'platform-id',
  platform_id: 'pid',
  title: 'My Platform',
  url: 'https://platform.example.com',
  identifier: ServiceDefinitionIdentifierEnum.OPENCTI_REGISTRATION,
  contract: PlatformContractEnum.EE,
  deployment_request: null,
  subscription: {
    start_date: '2025-01-01',
    end_date: null,
    service_instance: { id: 'service-instance-id' },
    organization: { id: 'org-id' },
  },
};

const trialPlatform: registeredPlatformByServiceInstanceId_fragment$data = {
  ...basePlatform,
  contract: PlatformContractEnum.TRIAL,
  deployment_request: {
    id: 'dr-id',
    hub_status: DeploymentRequestHubStatusEnum.ACTIVE,
    region: 'eu_west',
    platform_identifier: PlatformIdentifierEnum.OPENCTI,
    counts_in_orga_quota: true,
  },
  subscription: {
    ...basePlatform.subscription!,
    end_date: '2025-04-01',
  },
};

const renderDetails = (
  platform: registeredPlatformByServiceInstanceId_fragment$data,
  me?: NonNullable<Parameters<typeof testRender>[1]>['me']
) => {
  mockPlatformData = platform;
  return testRender(<RegistrationDetails registeredPlatform={{} as never} />, {
    relayConfig: createMockEnvironment(),
    me,
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('RegistrationDetails', () => {
  describe('Access button', () => {
    it.each`
      label                                | platform                                                                                                                                 | shouldShow
      ${'trial, ACTIVE status, with url'}  | ${trialPlatform}                                                                                                                         | ${true}
      ${'trial, PENDING status, with url'} | ${{ ...trialPlatform, deployment_request: { ...trialPlatform.deployment_request, hub_status: DeploymentRequestHubStatusEnum.PENDING } }} | ${false}
      ${'trial, ACTIVE status, no url'}    | ${{ ...trialPlatform, url: '' }}                                                                                                         | ${false}
      ${'non-trial with url'}              | ${basePlatform}                                                                                                                          | ${true}
    `('should show=$shouldShow for $label', ({ platform, shouldShow }) => {
      renderDetails(platform);
      const accessLink = screen.queryByRole('link', { name: /Access/i });
      if (shouldShow) {
        expect(accessLink).toBeInTheDocument();
      } else {
        expect(accessLink).not.toBeInTheDocument();
      }
    });
  });

  describe('Cancel button in status row', () => {
    it.each`
      hubStatus                                      | shouldShow
      ${DeploymentRequestHubStatusEnum.PENDING}      | ${true}
      ${DeploymentRequestHubStatusEnum.ACTIVE}       | ${true}
      ${DeploymentRequestHubStatusEnum.PROVISIONING} | ${true}
      ${DeploymentRequestHubStatusEnum.QUEUED}       | ${true}
      ${DeploymentRequestHubStatusEnum.EXPIRED}      | ${false}
      ${DeploymentRequestHubStatusEnum.CANCELLED}    | ${false}
    `(
      'should show Cancel=$shouldShow for status $hubStatus',
      ({ hubStatus, shouldShow }) => {
        renderDetails({
          ...trialPlatform,
          deployment_request: {
            ...trialPlatform.deployment_request!,
            hub_status: hubStatus,
          },
        });
        const cancelButton = screen.queryByRole('button', {
          name: /Utils.Cancel/i,
        });
        if (shouldShow) {
          expect(cancelButton).toBeInTheDocument();
        } else {
          expect(cancelButton).not.toBeInTheDocument();
        }
      }
    );

    it('should not show status row when there is no deployment_request', () => {
      renderDetails(basePlatform);
      expect(screen.queryByText(/Status:/i)).not.toBeInTheDocument();
    });
  });

  describe('Date labels', () => {
    it('should show "Start date" and "End date" for trial, not "Registered on"', () => {
      renderDetails(trialPlatform);
      expect(screen.getByText(/Start date:/i)).toBeInTheDocument();
      expect(screen.getByText(/End date:/i)).toBeInTheDocument();
      expect(screen.queryByText(/Registered on:/i)).not.toBeInTheDocument();
    });

    it('should show "Registered on" for non-trial, not "Start date" or "End date"', () => {
      renderDetails(basePlatform);
      expect(screen.getByText(/Registered on:/i)).toBeInTheDocument();
      expect(screen.queryByText(/Start date:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/End date:/i)).not.toBeInTheDocument();
    });
  });

  describe('TrialsManageUsersDialog visibility', () => {
    it.each`
      label                             | capabilities                                                 | shouldShow
      ${'ADMINISTRATE_ORGANIZATION'}    | ${[OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION]}    | ${true}
      ${'MANAGE_PLATFORM_REGISTRATION'} | ${[OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION]} | ${true}
      ${'no capability'}                | ${[]}                                                        | ${false}
    `(
      'should show=$shouldShow on trial + ACTIVE when user has $label',
      ({ capabilities, shouldShow }) => {
        renderDetails(trialPlatform, {
          selected_org_capabilities: capabilities,
        });
        if (shouldShow) {
          expect(screen.getByTestId('manage-users-dialog')).toBeInTheDocument();
        } else {
          expect(
            screen.queryByTestId('manage-users-dialog')
          ).not.toBeInTheDocument();
        }
      }
    );

    it('should not show when trial but deployment is not ACTIVE', () => {
      renderDetails(
        {
          ...trialPlatform,
          deployment_request: {
            ...trialPlatform.deployment_request!,
            hub_status: DeploymentRequestHubStatusEnum.PENDING,
          },
        },
        {
          selected_org_capabilities: [
            OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
          ],
        }
      );
      expect(
        screen.queryByTestId('manage-users-dialog')
      ).not.toBeInTheDocument();
    });

    it('should not show for non-trial even with capability', () => {
      renderDetails(basePlatform, {
        selected_org_capabilities: [
          OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
        ],
      });
      expect(
        screen.queryByTestId('manage-users-dialog')
      ).not.toBeInTheDocument();
    });

    it('should not show when trial + ACTIVE + capability but no serviceInstanceId', () => {
      renderDetails(
        {
          ...trialPlatform,
          subscription: {
            ...trialPlatform.subscription!,
            service_instance: null,
          },
        },
        {
          selected_org_capabilities: [
            OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
          ],
        }
      );
      expect(
        screen.queryByTestId('manage-users-dialog')
      ).not.toBeInTheDocument();
    });
  });

  describe('Update Platform button', () => {
    const updateCapabilities = [
      OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
      OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
    ];

    it.each`
      label                                             | platform         | capabilities                                                 | shouldShow
      ${'non-trial, both update capabilities'}          | ${basePlatform}  | ${updateCapabilities}                                        | ${true}
      ${'trial, both update capabilities'}              | ${trialPlatform} | ${updateCapabilities}                                        | ${false}
      ${'non-trial, only ADMINISTRATE_ORGANIZATION'}    | ${basePlatform}  | ${[OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION]}    | ${false}
      ${'non-trial, only MANAGE_PLATFORM_REGISTRATION'} | ${basePlatform}  | ${[OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION]} | ${false}
      ${'non-trial, no capabilities'}                   | ${basePlatform}  | ${[]}                                                        | ${false}
    `(
      'should show=$shouldShow for $label',
      ({ platform, capabilities, shouldShow }) => {
        renderDetails(platform, { selected_org_capabilities: capabilities });
        const updateButton = screen.queryByRole('button', {
          name: /Platform.Update/i,
        });
        if (shouldShow) {
          expect(updateButton).toBeInTheDocument();
        } else {
          expect(updateButton).not.toBeInTheDocument();
        }
      }
    );

    it('should show for BYPASS user on non-trial with serviceInstanceId', () => {
      renderDetails(basePlatform, {
        capabilities: [{ name: PortalCapabilityEnum.BYPASS }],
      });
      expect(
        screen.getByRole('button', { name: /Platform.Update/i })
      ).toBeInTheDocument();
    });

    it('should not show when non-trial with update capabilities but no serviceInstanceId', () => {
      renderDetails(
        {
          ...basePlatform,
          subscription: {
            ...basePlatform.subscription!,
            service_instance: null,
          },
        },
        { selected_org_capabilities: updateCapabilities }
      );
      expect(
        screen.queryByRole('button', { name: /Platform.Update/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('openForm search param', () => {
    it('should pass defaultOpen=true to TrialsManageUsersDialog when openForm=true', () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams('openForm=true'));
      renderDetails(trialPlatform, {
        selected_org_capabilities: [
          OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
        ],
      });
      const dialog = screen.getByTestId('manage-users-dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('data-default-open', 'true');
    });

    it('should pass defaultOpen=false to TrialsManageUsersDialog when openForm is absent', () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams());
      renderDetails(trialPlatform, {
        selected_org_capabilities: [
          OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
        ],
      });
      expect(screen.getByTestId('manage-users-dialog')).toHaveAttribute(
        'data-default-open',
        'false'
      );
    });
  });
});
