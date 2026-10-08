import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { ConnectedProductButtons } from '@/components/service/registration/ConnectedProductButtons';
import {
  basePlatform,
  trialPlatform,
  trialPlatformWithAccess,
} from '@/components/service/registration/registered-platform.fixtures';
import testRender from '@/utils/test/test-render';
import {
  DeploymentRequestHubStatus,
  OrganizationCapability,
  PlatformIdentifier,
  PortalCapability,
  RegisteredPlatformDetailFragment,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { registrationKeys } from '@graphql/registration/registration.keys';
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from 'relay-test-utils';
import { describe, expect, it, vi } from 'vitest';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const GROUP_NAME = 'Admin';
const USER_EMAIL = 'analyst@filigran.io';
const MANAGE_USERS = 'Service.Trials.ManageUsers.Title';
const UNREGISTER = 'Unregister.Unregister';
const ADMINISTRATE_ORGANIZATION = [
  OrganizationCapability.AdministrateOrganization,
];

const serviceInstanceId =
  trialPlatformWithAccess.subscription!.service_instance!.id;
const organizationId = trialPlatformWithAccess.subscription!.organization.id;

const mockSearchParams = (query: string) =>
  vi
    .mocked(useSearchParams)
    .mockReturnValue(
      new URLSearchParams(query) as unknown as ReturnType<
        typeof useSearchParams
      >
    );

const renderButtons = (
  platform: RegisteredPlatformDetailFragment,
  me?: NonNullable<Parameters<typeof testRender>[1]>['me'],
  {
    environment = createMockEnvironment(),
  }: {
    environment?: RelayMockEnvironment;
  } = {}
) =>
  testRender(<ConnectedProductButtons platform={platform} />, {
    me,
    relayConfig: environment,
  });

// Resolves every pending operation: opening the manage users form loads the
// users, then the service groups; submitting a form commits a mutation.
const resolvePendingOperations = async (environment: RelayMockEnvironment) => {
  while (environment.mock.getAllOperations().length > 0) {
    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          ServiceGroup: () => ({ name: GROUP_NAME, users: [] }),
          User: () => ({ email: USER_EMAIL }),
        })
      );
    });
  }
};

const queryManageUsersButton = () =>
  screen.queryByRole('button', { name: MANAGE_USERS });

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ConnectedProductButtons', () => {
  describe('Layout', () => {
    it.each`
      direction    | expectedClass
      ${undefined} | ${'flex-col'}
      ${'column'}  | ${'flex-col'}
      ${'row'}     | ${'flex-row'}
    `(
      'should lay the buttons out in $expectedClass when direction is $direction',
      ({ direction, expectedClass }) => {
        renderButtons(basePlatform, undefined, { direction });

        expect(screen.getByRole('link').parentElement).toHaveClass(
          expectedClass
        );
      }
    );
  });

  describe('Access button', () => {
    it.each`
      label                                             | platform                                                                                                                                                 | shouldShow
      ${'trial, ACTIVE status, with url, no myGroups'}  | ${trialPlatform}                                                                                                                                         | ${false}
      ${'trial, ACTIVE status, with url and myGroups'}  | ${trialPlatformWithAccess}                                                                                                                               | ${true}
      ${'trial, PENDING status, with url and myGroups'} | ${{ ...trialPlatformWithAccess, deployment_request: { ...trialPlatformWithAccess.deployment_request, hub_status: DeploymentRequestHubStatus.Pending } }} | ${false}
      ${'trial, ACTIVE status, no url'}                 | ${{ ...trialPlatformWithAccess, url: '' }}                                                                                                               | ${false}
      ${'non-trial with url'}                           | ${basePlatform}                                                                                                                                          | ${true}
      ${'non-trial, no url'}                            | ${{ ...basePlatform, url: '' }}                                                                                                                          | ${false}
    `('should show=$shouldShow for $label', ({ platform, shouldShow }) => {
      renderButtons(platform);
      const accessLink = screen.queryByRole('link', { name: /Access/i });
      if (shouldShow) {
        expect(accessLink).toBeInTheDocument();
      } else {
        expect(accessLink).not.toBeInTheDocument();
      }
    });

    it('should open the platform in a new tab without exposing the hub', () => {
      renderButtons(basePlatform);

      const accessLink = screen.getByRole('link', { name: /Access/i });
      expect(accessLink).toHaveAttribute('href', basePlatform.url);
      expect(accessLink).toHaveAttribute('target', '_blank');
      expect(accessLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it.each`
      identifier                                         | platformIdentifier
      ${ServiceDefinitionIdentifier.OpenctiRegistration} | ${PlatformIdentifier.Opencti}
      ${ServiceDefinitionIdentifier.OpenaevRegistration} | ${PlatformIdentifier.Openaev}
    `(
      'should name the $platformIdentifier product in the access button',
      ({ identifier, platformIdentifier }) => {
        renderButtons({ ...basePlatform, identifier });

        expect(
          screen.getByRole('link', {
            name: `Register.Details.Access ${PlatformMetadataMapping[platformIdentifier as PlatformIdentifier].name}`,
          })
        ).toBeInTheDocument();
      }
    );
  });

  describe('TrialsManageUsersDialog visibility', () => {
    it.each`
      label                             | me                                                                                    | shouldShow
      ${'ADMINISTRATE_ORGANIZATION'}    | ${{ selected_org_capabilities: ADMINISTRATE_ORGANIZATION }}                           | ${true}
      ${'MANAGE_PLATFORM_REGISTRATION'} | ${{ selected_org_capabilities: [OrganizationCapability.ManagePlatformRegistration] }} | ${true}
      ${'BYPASS'}                       | ${{ capabilities: [{ name: PortalCapability.Bypass }] }}                              | ${true}
      ${'no capability'}                | ${{ selected_org_capabilities: [] }}                                                  | ${false}
    `(
      'should show=$shouldShow on trial + ACTIVE + myGroups when user has $label',
      ({ me, shouldShow }) => {
        renderButtons(trialPlatformWithAccess, me);
        if (shouldShow) {
          expect(queryManageUsersButton()).toBeInTheDocument();
        } else {
          expect(queryManageUsersButton()).not.toBeInTheDocument();
        }
      }
    );

    it('should not show when trial but deployment is not ACTIVE', () => {
      renderButtons(
        {
          ...trialPlatformWithAccess,
          deployment_request: {
            ...trialPlatformWithAccess.deployment_request!,
            hub_status: DeploymentRequestHubStatus.Pending,
          },
        },
        { selected_org_capabilities: ADMINISTRATE_ORGANIZATION }
      );
      expect(queryManageUsersButton()).not.toBeInTheDocument();
    });

    it('should not show when trial + ACTIVE + capability but no myGroups', () => {
      renderButtons(trialPlatform, {
        selected_org_capabilities: ADMINISTRATE_ORGANIZATION,
      });
      expect(queryManageUsersButton()).not.toBeInTheDocument();
    });

    it('should not show for non-trial even with capability', () => {
      renderButtons(basePlatform, {
        selected_org_capabilities: ADMINISTRATE_ORGANIZATION,
      });
      expect(queryManageUsersButton()).not.toBeInTheDocument();
    });

    it('should not show when trial + ACTIVE + myGroups + capability but no serviceInstanceId', () => {
      renderButtons(
        {
          ...trialPlatformWithAccess,
          subscription: null,
        },
        { selected_org_capabilities: ADMINISTRATE_ORGANIZATION }
      );
      expect(queryManageUsersButton()).not.toBeInTheDocument();
    });
  });

  describe('TrialsManageUsersDialog', () => {
    it('should load the groups of the trial and the users of its organization', async () => {
      const environment = createMockEnvironment();
      const { user } = renderButtons(
        trialPlatformWithAccess,
        { selected_org_capabilities: ADMINISTRATE_ORGANIZATION },
        { environment }
      );

      await user.click(screen.getByRole('button', { name: MANAGE_USERS }));

      const variables = () =>
        environment.mock
          .getAllOperations()
          .map((operation) => operation.request.variables);
      expect(variables()).toContainEqual(
        expect.objectContaining({
          filters: [{ key: 'organization_id', value: [organizationId] }],
        })
      );
      await act(async () => {
        environment.mock.resolveMostRecentOperation((operation) =>
          MockPayloadGenerator.generate(operation)
        );
      });
      expect(variables()).toContainEqual({ serviceInstanceId });
    });

    it('should refresh the registered platform once the users are saved', async () => {
      const invalidateQueriesSpy = vi.spyOn(
        QueryClient.prototype,
        'invalidateQueries'
      );
      const environment = createMockEnvironment();
      const { user } = renderButtons(
        trialPlatformWithAccess,
        { selected_org_capabilities: ADMINISTRATE_ORGANIZATION },
        { environment }
      );
      await user.click(screen.getByRole('button', { name: MANAGE_USERS }));
      await resolvePendingOperations(environment);

      await user.click(
        await screen.findByRole('combobox', { name: GROUP_NAME })
      );
      await user.click(screen.getByRole('option', { name: USER_EMAIL }));
      await user.click(screen.getByRole('button', { name: 'Utils.Validate' }));
      expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
        queryKey: registrationKeys.registeredPlatformByServiceInstanceIdAll(),
      });
      await resolvePendingOperations(environment);

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: registrationKeys.registeredPlatformByServiceInstanceIdAll(),
      });
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
        renderButtons(platform, { selected_org_capabilities: capabilities });
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
      renderButtons(basePlatform, {
        capabilities: [{ name: PortalCapability.Bypass }],
      });
      expect(
        screen.getByRole('button', { name: /Platform.Update/i })
      ).toBeInTheDocument();
    });

    it('should not show when non-trial with update capabilities but no serviceInstanceId', () => {
      renderButtons(
        {
          ...basePlatform,
          subscription: null,
        },
        { selected_org_capabilities: updateCapabilities }
      );
      expect(
        screen.queryByRole('button', { name: /Platform.Update/i })
      ).not.toBeInTheDocument();
    });

    it('should open the update sheet prefilled with the platform only on click', async () => {
      const { user } = renderButtons(basePlatform, {
        selected_org_capabilities: ADMINISTRATE_ORGANIZATION,
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await user.click(
        screen.getByRole('button', { name: /Platform.Update/i })
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: /Platform\.Name/ })
      ).toHaveValue(basePlatform.title);
      expect(
        screen.getByRole('textbox', { name: /Register\.Details\.ProductURL/ })
      ).toHaveValue(basePlatform.url);
    });

    it('should close the update sheet on cancel', async () => {
      const { user } = renderButtons(basePlatform, {
        selected_org_capabilities: ADMINISTRATE_ORGANIZATION,
      });
      await user.click(
        screen.getByRole('button', { name: /Platform.Update/i })
      );

      await user.click(screen.getByRole('button', { name: 'Utils.Cancel' }));

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );
    });

    it('should refresh the registered platform once it is updated', async () => {
      const invalidateQueriesSpy = vi.spyOn(
        QueryClient.prototype,
        'invalidateQueries'
      );
      const environment = createMockEnvironment();
      const { user } = renderButtons(
        basePlatform,
        { selected_org_capabilities: ADMINISTRATE_ORGANIZATION },
        { environment }
      );

      await user.click(
        screen.getByRole('button', { name: /Platform.Update/i })
      );
      await user.click(screen.getByRole('button', { name: 'Utils.Update' }));
      expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
        queryKey: registrationKeys.registeredPlatformByServiceInstanceIdAll(),
      });
      await resolvePendingOperations(environment);

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: registrationKeys.registeredPlatformByServiceInstanceIdAll(),
      });
    });
  });

  describe('Unregister button', () => {
    it.each`
      label                                     | platform         | capabilities                 | shouldShow
      ${'non-trial, ADMINISTRATE_ORGANIZATION'} | ${basePlatform}  | ${ADMINISTRATE_ORGANIZATION} | ${true}
      ${'non-trial, no capability'}             | ${basePlatform}  | ${[]}                        | ${false}
      ${'trial, ADMINISTRATE_ORGANIZATION'}     | ${trialPlatform} | ${ADMINISTRATE_ORGANIZATION} | ${false}
    `(
      'should show=$shouldShow for $label',
      ({ platform, capabilities, shouldShow }) => {
        renderButtons(platform, { selected_org_capabilities: capabilities });
        const unregisterButton = screen.queryByRole('button', {
          name: UNREGISTER,
        });
        if (shouldShow) {
          expect(unregisterButton).toBeInTheDocument();
        } else {
          expect(unregisterButton).not.toBeInTheDocument();
        }
      }
    );
  });

  describe('openForm search param', () => {
    it.each`
      query               | shouldOpen
      ${'openForm=true'}  | ${true}
      ${'openForm=false'} | ${false}
      ${''}               | ${false}
    `(
      'should open the manage users sheet=$shouldOpen when the query is "$query"',
      async ({ query, shouldOpen }) => {
        mockSearchParams(query);
        const environment = createMockEnvironment();
        renderButtons(
          trialPlatformWithAccess,
          { selected_org_capabilities: ADMINISTRATE_ORGANIZATION },
          { environment }
        );
        await resolvePendingOperations(environment);

        if (shouldOpen) {
          expect(
            await screen.findByRole('dialog', { name: MANAGE_USERS })
          ).toBeInTheDocument();
        } else {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        }
      }
    );
  });
});
