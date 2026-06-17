import ServiceListHeaderButtons from '@/components/service/components/header/ServiceListHeaderButtons';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import testRender from '@/utils/test/test-render';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import { ServiceRestrictionEnum } from '@generated/models/ServiceRestriction.enum';
import { createMockEnvironment } from 'relay-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseServiceContext, mockSetIntegrationType } = vi.hoisted(() => ({
  mockUseServiceContext: vi.fn(),
  mockSetIntegrationType: vi.fn(),
}));

vi.mock('@/components/service/components/ServiceContext', () => ({
  useServiceContext: mockUseServiceContext,
}));

const buildServiceContext = (overrides = {}) => ({
  serviceInstance: {
    id: 'service-1',
    capabilities: [],
  },
  translationKey: 'Service.OpenctiCustomDashboards',
  type: ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD,
  setIntegrationType: mockSetIntegrationType,
  currentUserSubscriptionId: 'subscription-1',
  ...overrides,
});

describe('ServiceListHeaderButtons', () => {
  beforeEach(() => {
    mockUseServiceContext.mockReturnValue(buildServiceContext());
  });

  it.each`
    portalCapabilities                         | serviceCapabilities                       | organizationCapabilities                                  | shouldRender
    ${[]}                                      | ${[ServiceRestrictionEnum.MANAGE_ACCESS]} | ${[]}                                                     | ${true}
    ${[]}                                      | ${[ServiceRestrictionEnum.MANAGE_ACCESS]} | ${[OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION]} | ${true}
    ${[]}                                      | ${[]}                                     | ${[OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION]} | ${true}
    ${[]}                                      | ${[]}                                     | ${[OrganizationCapabilityEnum.MANAGE_SUBSCRIPTION]}       | ${true}
    ${[]}                                      | ${[]}                                     | ${[]}                                                     | ${false}
    ${[{ name: PortalCapabilityEnum.BYPASS }]} | ${[]}                                     | ${[]}                                                     | ${true}
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
