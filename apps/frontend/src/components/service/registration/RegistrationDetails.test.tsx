import { RegistrationDetails } from '@/components/service/registration/RegistrationDetails';
import testRender from '@/utils/test/test-render';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import {
  OrganizationCapability,
  PlatformContract,
  PortalCapability,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { screen, within } from '@testing-library/react';
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

vi.mock('@/components/service/registration/UnregisterButton', () => ({
  UnregisterButton: () => null,
}));

let mockPlatformData: registeredPlatformByServiceInstanceId_fragment$data;

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal()),
  useFragment: () => mockPlatformData,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const LAST_CONNECTIVITY_CHECK = '2025-03-10T12:00:00.000Z';

const basePlatform: registeredPlatformByServiceInstanceId_fragment$data = {
  ' $fragmentType': 'registeredPlatformByServiceInstanceId_fragment',
  id: 'platform-id',
  platform_id: 'pid',
  tenant_id: null,
  title: 'My Platform',
  url: 'https://platform.example.com',
  identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
  contract: PlatformContract.Ee,
  subscription: {
    start_date: '2025-01-01',
    end_date: null,
    service_instance: { id: 'service-instance-id' },
  },
};

const trialPlatform: registeredPlatformByServiceInstanceId_fragment$data = {
  ...basePlatform,
  contract: PlatformContract.Trial,
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
    it('should show the access link when the platform is not a trial', () => {
      // Given
      renderDetails(basePlatform);

      // When
      const accessLink = screen.queryByRole('link', { name: /Access/i });

      // Then
      expect(accessLink).toBeInTheDocument();
    });

    it('should hide the access link when the platform is a trial', () => {
      // Given
      renderDetails(trialPlatform);

      // When
      const accessLink = screen.queryByRole('link', { name: /Access/i });

      // Then
      expect(accessLink).not.toBeInTheDocument();
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

    it('should show the connection status and last check rows when the platform is not a trial', () => {
      // Given
      renderDetails({
        ...basePlatform,
        last_connectivity_check: LAST_CONNECTIVITY_CHECK,
      });

      // When
      const connectionStatusRow = screen.queryByText(
        /Register\.Details\.ConnectionStatus\.Title/i
      );
      const lastConnectionCheckRow = screen.queryByText(
        /Register\.Details\.LastConnectionCheck/i
      );

      // Then
      expect(connectionStatusRow).toBeInTheDocument();
      expect(lastConnectionCheckRow).toBeInTheDocument();
    });

    it('should hide the connection status and last check rows when the platform is a trial', () => {
      // Given
      renderDetails({
        ...trialPlatform,
        last_connectivity_check: LAST_CONNECTIVITY_CHECK,
      });

      // When
      const connectionStatusRow = screen.queryByText(
        /Register\.Details\.ConnectionStatus\.Title/i
      );
      const lastConnectionCheckRow = screen.queryByText(
        /Register\.Details\.LastConnectionCheck/i
      );

      // Then
      expect(connectionStatusRow).not.toBeInTheDocument();
      expect(lastConnectionCheckRow).not.toBeInTheDocument();
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
});
