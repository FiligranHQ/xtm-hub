import { UnregisterButton } from '@/components/service/registration/UnregisterButton';
import testRender from '@/utils/test/test-render';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import {
  OrganizationCapability,
  PlatformContract,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { createMockEnvironment } from 'relay-test-utils';

describe('Display unregister button', () => {
  const registeredPlatform = {
    id: 'test-platform-id',
    identifier: ServiceDefinitionIdentifier.OpenaevRegistration,
    platform_id: 'id',
    tenant_id: null,
    title: 'title',
    url: 'url',
  };
  it.each`
    capabilities                                                                                            | isTrial  | shouldDisplay
    ${[OrganizationCapability.AdministrateOrganization]}                                                    | ${true}  | ${false}
    ${[OrganizationCapability.ManagePlatformRegistration]}                                                  | ${true}  | ${false}
    ${[OrganizationCapability.ManagePlatformRegistration, OrganizationCapability.AdministrateOrganization]} | ${true}  | ${false}
    ${[OrganizationCapability.ManageSubscription]}                                                          | ${true}  | ${false}
    ${[]}                                                                                                   | ${true}  | ${false}
    ${[OrganizationCapability.AdministrateOrganization]}                                                    | ${false} | ${true}
    ${[OrganizationCapability.ManagePlatformRegistration]}                                                  | ${false} | ${true}
    ${[OrganizationCapability.ManagePlatformRegistration, OrganizationCapability.AdministrateOrganization]} | ${false} | ${true}
    ${[OrganizationCapability.ManageSubscription]}                                                          | ${false} | ${false}
    ${[]}                                                                                                   | ${false} | ${false}
  `(
    'Should display unregister button if user has capability $capabilities and is trial $isTrial',
    async ({ capabilities, isTrial, shouldDisplay }) => {
      // Given
      const environment = createMockEnvironment();
      const platformInput = {
        contract: isTrial ? PlatformContract.Trial : PlatformContract.Ce,
        ...registeredPlatform,
      } as registeredPlatformByServiceInstanceId_fragment$data;
      const { queryByRole } = testRender(
        <UnregisterButton platform={platformInput} />,
        {
          me: {
            selected_org_capabilities: capabilities,
          },
          relayConfig: environment,
        }
      );
      // Then
      const unregisterButton = queryByRole('button', {
        name: /Unregister/i,
      });
      if (shouldDisplay) {
        expect(unregisterButton).toBeInTheDocument();
      } else {
        expect(unregisterButton).not.toBeInTheDocument();
      }
    }
  );
});
