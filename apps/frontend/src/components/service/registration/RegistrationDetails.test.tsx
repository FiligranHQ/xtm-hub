import { RegistrationDetails } from '@/components/service/registration/RegistrationDetails';
import testRender from '@/utils/test/test-render';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import {
  DeploymentRequestHubStatus,
  OrganizationCapability,
  PlatformContract,
  PlatformIdentifier,
  PortalCapability,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { screen, within } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import { createMockEnvironment } from 'relay-test-utils';
import { describe, expect, it, vi } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/components/service/components/PlatformUpdateSheet', () => ({
  PlatformUpdateSheet: ({ platformUrl }: { platformUrl: string }) => (
    <div
      data-testid="platform-update-sheet"
      data-url={platformUrl}
    />
  ),
}));

vi.mock('@/components/service/trial-instances/TrialCancelSheet', () => ({
  TrialCancelSheet: () => null,
}));

vi.mock('@/components/service/registration/UnregisterButton', () => ({
  UnregisterButton: () => null,
}));

vi.mock(
  '@/components/service/trial-instances/manage-users/TrialsManageUsersDialog',
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
  myGroups: null,
  tenant_id: null,
  title: 'My Platform',
  url: 'https://platform.example.com',
  identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
  contract: PlatformContract.Ee,
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
  contract: PlatformContract.Trial,
  deployment_request: {
    id: 'dr-id',
    hub_status: DeploymentRequestHubStatus.Active,
    region: 'eu_west',
    platform_identifier: PlatformIdentifier.Opencti,
    counts_in_orga_quota: true,
    requester_email: 'trial-admin@filigran.io',
  },
  subscription: {
    ...basePlatform.subscription!,
    end_date: '2025-04-01',
  },
};

const trialPlatformWithAccess: registeredPlatformByServiceInstanceId_fragment$data =
  {
    ...trialPlatform,
    myGroups: [{ name: 'Admin' }],
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
      label                                             | platform                                                                                                                                                 | shouldShow
      ${'trial, ACTIVE status, with url, no myGroups'}  | ${trialPlatform}                                                                                                                                         | ${false}
      ${'trial, ACTIVE status, with url and myGroups'}  | ${trialPlatformWithAccess}                                                                                                                               | ${true}
      ${'trial, PENDING status, with url and myGroups'} | ${{ ...trialPlatformWithAccess, deployment_request: { ...trialPlatformWithAccess.deployment_request, hub_status: DeploymentRequestHubStatus.Pending } }} | ${false}
      ${'trial, ACTIVE status, no url'}                 | ${{ ...trialPlatformWithAccess, url: '' }}                                                                                                               | ${false}
      ${'non-trial with url'}                           | ${basePlatform}                                                                                                                                          | ${true}
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
      hubStatus                                  | shouldShow
      ${DeploymentRequestHubStatus.Pending}      | ${true}
      ${DeploymentRequestHubStatus.Active}       | ${true}
      ${DeploymentRequestHubStatus.Provisioning} | ${true}
      ${DeploymentRequestHubStatus.Queued}       | ${true}
      ${DeploymentRequestHubStatus.Expired}      | ${false}
      ${DeploymentRequestHubStatus.Cancelled}    | ${false}
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
      expect(
        screen.queryByText(/Register\.Details\.Status/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Details rows', () => {
    it('should render the platform URL value in the Platform URL row when URL exists', () => {
      renderDetails(basePlatform);

      const platformUrlLabel = screen.getByText(
        /Register\.Details\.ProductURL/i
      );
      const platformUrlRow = platformUrlLabel.closest('li');

      expect(platformUrlRow).not.toBeNull();
      expect(
        within(platformUrlRow as HTMLElement).getByText(basePlatform.url)
      ).toBeInTheDocument();
      expect(
        within(platformUrlRow as HTMLElement).queryByText('-')
      ).not.toBeInTheDocument();
    });

    it('should render "-" in the Platform URL row when URL is empty', () => {
      renderDetails({
        ...basePlatform,
        url: '',
      });

      const platformUrlLabel = screen.getByText(
        /Register\.Details\.ProductURL/i
      );
      const platformUrlRow = platformUrlLabel.closest('li');

      expect(platformUrlRow).not.toBeNull();
      expect(
        within(platformUrlRow as HTMLElement).getByText('-')
      ).toBeInTheDocument();
    });

    it('should show "Start date" and "End date" for trial, not "Connected on"', () => {
      renderDetails(trialPlatform);
      expect(
        screen.getByText(/Register\.Details\.StartDate/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Register\.Details\.EndDate/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Register\.Details\.ConnectedOn/i)
      ).not.toBeInTheDocument();
    });

    it('should show "Connected on" for non-trial, not "Start date" or "End date"', () => {
      renderDetails(basePlatform);
      expect(
        screen.getByText(/Register\.Details\.ConnectedOn/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Register\.Details\.StartDate/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Register\.Details\.EndDate/i)
      ).not.toBeInTheDocument();
    });

    it('should hide connection status and last check rows for trial when deployment is not ACTIVE', () => {
      renderDetails({
        ...trialPlatform,
        last_connectivity_check: '2025-03-10T12:00:00.000Z',
        deployment_request: {
          ...trialPlatform.deployment_request!,
          hub_status: DeploymentRequestHubStatus.Pending,
        },
      });

      expect(
        screen.queryByText(/Register\.Details\.ConnectionStatus\.Title/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Register\.Details\.LastConnectionCheck/i)
      ).not.toBeInTheDocument();
    });

    it('should show connection status and last check rows for trial when deployment is ACTIVE', () => {
      renderDetails({
        ...trialPlatform,
        last_connectivity_check: '2025-03-10T12:00:00.000Z',
      });

      expect(
        screen.getByText(/Register\.Details\.ConnectionStatus\.Title/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Register\.Details\.LastConnectionCheck/i)
      ).toBeInTheDocument();
    });
  });

  describe('Access row for trial', () => {
    it.each`
      myGroups                                   | expectedText
      ${[{ name: 'Admin' }, { name: 'Reader' }]} | ${'Admin, Reader'}
      ${[{ name: 'Manager' }]}                   | ${'Manager'}
    `(
      'should show group names when myGroups is provided',
      ({ myGroups, expectedText }) => {
        renderDetails({
          ...trialPlatform,
          myGroups,
        });

        expect(screen.getByText(/Access:/i)).toBeInTheDocument();
        expect(screen.getByText(expectedText)).toBeInTheDocument();
        expect(
          screen.queryByText('RegistrationDetails.NoAccess')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('RegistrationDetails.NoAccessContact')
        ).not.toBeInTheDocument();
      }
    );

    it.each`
      myGroups     | description
      ${[]}        | ${'empty array'}
      ${null}      | ${'null value'}
      ${undefined} | ${'undefined value'}
    `(
      'should show fallback message when myGroups is $description',
      ({ myGroups }) => {
        renderDetails({
          ...trialPlatform,
          myGroups,
          deployment_request: {
            ...trialPlatform.deployment_request!,
            requester_email: 'admin@filigran.io',
          },
        });

        expect(
          screen.getByText('RegistrationDetails.NoAccess')
        ).toBeInTheDocument();
        expect(
          screen.getByText('RegistrationDetails.NoAccessContact')
        ).toBeInTheDocument();
      }
    );

    it('should render "No access" in red and contact info without red styling', () => {
      renderDetails({
        ...trialPlatform,
        myGroups: [],
        deployment_request: {
          ...trialPlatform.deployment_request!,
          requester_email: 'admin@filigran.io',
        },
      });

      const noAccessEl = screen.getByText('RegistrationDetails.NoAccess');
      expect(noAccessEl).toHaveClass('text-red-500');

      const contactEl = screen.getByText('RegistrationDetails.NoAccessContact');
      expect(contactEl).not.toHaveClass('text-red-500');
    });

    it('should not render access row for non-trial', () => {
      renderDetails({
        ...basePlatform,
        myGroups: [{ name: 'Admin' }],
      });

      expect(screen.queryByText(/Access:/i)).not.toBeInTheDocument();
    });

    it('should not render access row for trial that is not ACTIVE', () => {
      renderDetails({
        ...trialPlatform,
        myGroups: [{ name: 'Admin' }],
        deployment_request: {
          ...trialPlatform.deployment_request!,
          hub_status: DeploymentRequestHubStatus.Pending,
        },
      });

      expect(screen.queryByText(/Access:/i)).not.toBeInTheDocument();
    });
  });

  describe('TrialsManageUsersDialog visibility', () => {
    it.each`
      label                             | capabilities                                           | shouldShow
      ${'ADMINISTRATE_ORGANIZATION'}    | ${[OrganizationCapability.AdministrateOrganization]}   | ${true}
      ${'MANAGE_PLATFORM_REGISTRATION'} | ${[OrganizationCapability.ManagePlatformRegistration]} | ${true}
      ${'no capability'}                | ${[]}                                                  | ${false}
    `(
      'should show=$shouldShow on trial + ACTIVE + myGroups when user has $label',
      ({ capabilities, shouldShow }) => {
        renderDetails(trialPlatformWithAccess, {
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
          ...trialPlatformWithAccess,
          deployment_request: {
            ...trialPlatformWithAccess.deployment_request!,
            hub_status: DeploymentRequestHubStatus.Pending,
          },
        },
        {
          selected_org_capabilities: [
            OrganizationCapability.AdministrateOrganization,
          ],
        }
      );
      expect(
        screen.queryByTestId('manage-users-dialog')
      ).not.toBeInTheDocument();
    });

    it('should not show when trial + ACTIVE + capability but no myGroups', () => {
      renderDetails(trialPlatform, {
        selected_org_capabilities: [
          OrganizationCapability.AdministrateOrganization,
        ],
      });
      expect(
        screen.queryByTestId('manage-users-dialog')
      ).not.toBeInTheDocument();
    });

    it('should not show for non-trial even with capability', () => {
      renderDetails(basePlatform, {
        selected_org_capabilities: [
          OrganizationCapability.AdministrateOrganization,
        ],
      });
      expect(
        screen.queryByTestId('manage-users-dialog')
      ).not.toBeInTheDocument();
    });

    it('should not show when trial + ACTIVE + myGroups + capability but no serviceInstanceId', () => {
      renderDetails(
        {
          ...trialPlatformWithAccess,
          subscription: {
            ...trialPlatformWithAccess.subscription!,
            service_instance: null,
          },
        },
        {
          selected_org_capabilities: [
            OrganizationCapability.AdministrateOrganization,
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
      OrganizationCapability.AdministrateOrganization,
      OrganizationCapability.ManagePlatformRegistration,
    ];

    it.each`
      label                                             | platform         | capabilities                                           | shouldShow
      ${'trial, with update capabilities'}              | ${trialPlatform} | ${updateCapabilities}                                  | ${false}
      ${'non-trial, only ADMINISTRATE_ORGANIZATION'}    | ${basePlatform}  | ${[OrganizationCapability.AdministrateOrganization]}   | ${true}
      ${'non-trial, only MANAGE_PLATFORM_REGISTRATION'} | ${basePlatform}  | ${[OrganizationCapability.ManagePlatformRegistration]} | ${true}
      ${'non-trial, no capabilities'}                   | ${basePlatform}  | ${[]}                                                  | ${false}
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
        capabilities: [{ name: PortalCapability.Bypass }],
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

    it('should pass platform URL to PlatformUpdateSheet', () => {
      renderDetails(basePlatform, {
        selected_org_capabilities: [
          OrganizationCapability.AdministrateOrganization,
        ],
      });

      expect(screen.getByTestId('platform-update-sheet')).toHaveAttribute(
        'data-url',
        basePlatform.url
      );
    });
  });

  describe('openForm search param', () => {
    it('should pass defaultOpen=true to TrialsManageUsersDialog when openForm=true', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams('openForm=true') as unknown as ReturnType<
          typeof useSearchParams
        >
      );
      renderDetails(trialPlatformWithAccess, {
        selected_org_capabilities: [
          OrganizationCapability.AdministrateOrganization,
        ],
      });
      const dialog = screen.getByTestId('manage-users-dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('data-default-open', 'true');
    });

    it('should pass defaultOpen=false to TrialsManageUsersDialog when openForm is absent', () => {
      vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>
      );
      renderDetails(trialPlatformWithAccess, {
        selected_org_capabilities: [
          OrganizationCapability.AdministrateOrganization,
        ],
      });
      expect(screen.getByTestId('manage-users-dialog')).toHaveAttribute(
        'data-default-open',
        'false'
      );
    });
  });
});
