import testRender from '@/utils/test/test-render';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { createMockEnvironment } from 'relay-test-utils';
import { vi } from 'vitest';
import { UnregisterButton } from '@/components/service/registration/UnregisterButton';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('Display unregister button', () => {
  const registeredPlatform = {
    id: 'test-platform-id',
    identifier: ServiceDefinitionIdentifierEnum.OPENAEV_REGISTRATION,
    platform_id: 'id',
    tenant_id: null,
    title: 'title',
    url: 'url',
  };
  it.each`
    capabilities                                                                                                       | isTrial  | shouldDisplay
    ${[OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION]}                                                          | ${true}  | ${false}
    ${[OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION]}                                                       | ${true}  | ${false}
    ${[OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION, OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION]} | ${true}  | ${false}
    ${[OrganizationCapabilityEnum.MANAGE_SUBSCRIPTION]}                                                                | ${true}  | ${false}
    ${[]}                                                                                                              | ${true}  | ${false}
    ${[OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION]}                                                          | ${false} | ${true}
    ${[OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION]}                                                       | ${false} | ${true}
    ${[OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION, OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION]} | ${false} | ${true}
    ${[OrganizationCapabilityEnum.MANAGE_SUBSCRIPTION]}                                                                | ${false} | ${false}
    ${[]}                                                                                                              | ${false} | ${false}
  `(
    'Should display unregister button if user has capability $capabilities and is trial $isTrial',
    async ({ capabilities, isTrial, shouldDisplay }) => {
      // Given
      const environment = createMockEnvironment();
      const platformInput = {
        contract: isTrial
          ? PlatformContractEnum.TRIAL
          : PlatformContractEnum.CE,
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
