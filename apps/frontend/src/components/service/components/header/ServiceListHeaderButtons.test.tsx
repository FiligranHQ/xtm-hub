import ServiceListHeaderButtons from '@/components/service/components/header/ServiceListHeaderButtons';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import testRender from '@/utils/test/test-render';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { ServiceRestrictionEnum } from '@generated/models/ServiceRestriction.enum';
import { createMockEnvironment } from 'relay-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockUseServiceContext,
  mockUseServiceCapability,
  mockUseAdminByPass,
  mockSetIntegrationType,
} = vi.hoisted(() => ({
  mockUseServiceContext: vi.fn(),
  mockUseServiceCapability: vi.fn(),
  mockUseAdminByPass: vi.fn(),
  mockSetIntegrationType: vi.fn(),
}));

vi.mock('@/components/service/components/ServiceContext', () => ({
  useServiceContext: mockUseServiceContext,
}));

vi.mock('@/hooks/use-service-capability', () => ({
  default: mockUseServiceCapability,
}));

vi.mock('@/hooks/use-portal-capability', () => ({
  useAdminByPass: mockUseAdminByPass,
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
    mockUseServiceCapability.mockReturnValue(false);
    mockUseAdminByPass.mockReturnValue(false);
  });

  it.each`
    isBypass | serviceCapabilities                       | organizationCapabilities                                  | shouldRender
    ${false} | ${[ServiceRestrictionEnum.MANAGE_ACCESS]} | ${[]}                                                     | ${true}
    ${false} | ${[ServiceRestrictionEnum.MANAGE_ACCESS]} | ${[OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION]} | ${true}
    ${false} | ${[]}                                     | ${[OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION]} | ${true}
    ${false} | ${[]}                                     | ${[OrganizationCapabilityEnum.MANAGE_SUBSCRIPTION]}       | ${true}
    ${false} | ${[]}                                     | ${[]}                                                     | ${false}
    ${true}  | ${[]}                                     | ${[]}                                                     | ${true}
  `(
    'renders manage access button when shouldRender=$shouldRender',
    ({
      isBypass,
      serviceCapabilities,
      organizationCapabilities,
      shouldRender,
    }) => {
      // Given
      const environment = createMockEnvironment();
      mockUseAdminByPass.mockReturnValue(isBypass);
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
    mockUseServiceCapability.mockReturnValue(false);

    // When
    const { queryByRole, queryByText, queryByTestId } = testRender(
      <ServiceListHeaderButtons />,
      {
        relayConfig: environment,
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
