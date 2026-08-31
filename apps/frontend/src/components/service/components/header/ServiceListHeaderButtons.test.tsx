import ServiceListHeaderButtons from '@/components/service/components/header/ServiceListHeaderButtons';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import testRender from '@/utils/test/test-render';
import {
  OrganizationCapability,
  PortalCapability,
  ServiceRestriction,
} from '@graphql/generated';
import { createMockEnvironment } from 'relay-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseServiceContext, mockSetIntegrationType } = vi.hoisted(() => ({
  mockUseServiceContext: vi.fn(),
  mockSetIntegrationType: vi.fn(),
}));
const { mockUseServiceCapability } = vi.hoisted(() => ({
  mockUseServiceCapability: vi.fn(),
}));
const { mockUseServiceCapabilityWithSubscriptionId } = vi.hoisted(() => ({
  mockUseServiceCapabilityWithSubscriptionId: vi.fn(),
}));

vi.mock('@/components/service/components/ServiceContext', () => ({
  useServiceContext: mockUseServiceContext,
}));
vi.mock('@/hooks/use-service-capability', () => ({
  default: mockUseServiceCapability,
  useServiceCapabilityWithSubscriptionId:
    mockUseServiceCapabilityWithSubscriptionId,
}));

const buildServiceContext = (overrides = {}) => ({
  serviceInstance: {
    id: 'service-1',
    capabilities: [],
  },
  translationKey: 'Service.OpenctiCustomDashboards',
  type: ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD,
  setIntegrationType: mockSetIntegrationType,
  ...overrides,
});

describe('ServiceListHeaderButtons', () => {
  beforeEach(() => {
    mockUseServiceContext.mockReturnValue(buildServiceContext());
    mockUseServiceCapability.mockImplementation(
      (
        capability: ServiceRestriction,
        serviceInstance?: { capabilities?: ServiceRestriction[] }
      ) => {
        return serviceInstance?.capabilities?.includes(capability) ?? false;
      }
    );
    mockUseServiceCapabilityWithSubscriptionId.mockImplementation(
      (
        capability: ServiceRestriction,
        serviceInstance?: { capabilities?: ServiceRestriction[] }
      ) => ({
        hasCapability:
          serviceInstance?.capabilities?.includes(capability) ?? false,
        subscriptionId: 'subscription-1',
      })
    );
  });

  it.each`
    portalCapabilities                     | serviceCapabilities                  | organizationCapabilities                             | shouldRender
    ${[]}                                  | ${[ServiceRestriction.ManageAccess]} | ${[]}                                                | ${true}
    ${[]}                                  | ${[ServiceRestriction.ManageAccess]} | ${[OrganizationCapability.AdministrateOrganization]} | ${true}
    ${[]}                                  | ${[]}                                | ${[OrganizationCapability.AdministrateOrganization]} | ${true}
    ${[]}                                  | ${[]}                                | ${[OrganizationCapability.ManageSubscription]}       | ${true}
    ${[]}                                  | ${[]}                                | ${[]}                                                | ${false}
    ${[{ name: PortalCapability.Bypass }]} | ${[]}                                | ${[]}                                                | ${true}
  `(
    'renders manage access button when shouldRender=$shouldRender',
    ({
      portalCapabilities,
      serviceCapabilities,
      organizationCapabilities,
      shouldRender,
    }) => {
      // Given
      const environment = createMockEnvironment();
      mockUseServiceContext.mockReturnValue(
        buildServiceContext({
          serviceInstance: {
            id: 'service-1',
            capabilities: serviceCapabilities,
          },
        })
      );

      // When
      const { queryByRole } = testRender(<ServiceListHeaderButtons />, {
        relayConfig: environment,
        me: {
          capabilities: portalCapabilities,
          selected_org_capabilities: organizationCapabilities,
        },
      });

      // Then
      const manageLink = queryByRole('link', {
        name: 'Service.Capabilities.ManageAccessName',
      });

      if (!shouldRender) {
        expect(manageLink).toBeNull();
        return;
      }

      expect(manageLink).toBeInTheDocument();
      expect(manageLink).toHaveAttribute(
        'href',
        '/app/manage/service/service-1/subscription/subscription-1'
      );
    }
  );

  it('does not render update actions when user cannot upload', () => {
    // Given
    const environment = createMockEnvironment();

    // When
    const { queryByRole, queryByText, queryByTestId } = testRender(
      <ServiceListHeaderButtons />,
      {
        relayConfig: environment,
        me: {
          capabilities: [],
        },
      }
    );

    // Then
    expect(
      queryByRole('button', {
        name: 'Service.OpenctiCustomDashboards.AddService',
      })
    ).toBeNull();
    expect(queryByText('integration-dropdown')).toBeNull();
    expect(queryByTestId('service-manage-sheet')).toBeNull();
  });
});
