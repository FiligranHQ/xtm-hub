import { PortalContext } from '@/components/me/AppPortalContext';
import {
  getPrivateNavigationRegisteredPlatformsByIdentifier,
  getPrivateNavigationServiceHrefs,
} from '@/components/menu/private-navigation.utils';
import { usePrivateNavigation } from '@/components/menu/use-private-navigation';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { APP_PATH } from '@/utils/path/constant';
import { meContext_fragment$data } from '@generated/meContext_fragment.graphql';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import {
  OrderingMode,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
  ServiceInstanceOrdering,
} from '@graphql/generated';
import { renderHook } from '@testing-library/react';
import { createElement, PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const graphqlMocks = vi.hoisted(() => ({
  usePrivateNavigationServiceInstancesQuery: Object.assign(vi.fn(), {
    getKey: vi.fn((variables: unknown) => [
      'PrivateNavigationServiceInstances',
      variables,
    ]),
    getRootKey: vi.fn(() => ['PrivateNavigationServiceInstances']),
  }),
  usePrivateNavigationTrialEligibilityQuery: Object.assign(vi.fn(), {
    getKey: vi.fn((variables: unknown) => [
      'PrivateNavigationTrialEligibility',
      variables,
    ]),
    getRootKey: vi.fn(() => ['PrivateNavigationTrialEligibility']),
  }),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();

  return {
    ...actual,
    usePrivateNavigationServiceInstancesQuery:
      graphqlMocks.usePrivateNavigationServiceInstancesQuery,
    usePrivateNavigationTrialEligibilityQuery:
      graphqlMocks.usePrivateNavigationTrialEligibilityQuery,
  };
});

vi.mock('@/hooks/use-is-feature-enabled', () => ({
  useIsFeatureEnabled: vi.fn(),
}));

vi.mock('@/components/menu/private-navigation.utils', () => ({
  getPrivateNavigationServiceHrefs: vi.fn(),
  getPrivateNavigationRegisteredPlatformsByIdentifier: vi.fn(),
}));

vi.mock('@/lib/graphql-client', () => ({
  portalGraphqlClient: { _mock: 'portalGraphqlClient' },
}));

type RenderOptions = {
  selectedOrganizationId?: string;
  capabilities?: PortalCapabilityEnum[];
  organizationCapabilities?: OrganizationCapabilityEnum[];
  selectedOrganizationPersonalSpace?: boolean;
};

const buildHasCapability = (capabilities: PortalCapabilityEnum[]) => {
  return (capability: PortalCapabilityEnum) =>
    capabilities.includes(PortalCapabilityEnum.BYPASS) ||
    capabilities.includes(capability);
};

const buildHasOrganizationCapability = (
  capabilities: OrganizationCapabilityEnum[]
) => {
  return (capability: OrganizationCapabilityEnum) =>
    capabilities.includes(capability);
};

const renderUsePrivateNavigation = ({
  selectedOrganizationId,
  capabilities = [],
  organizationCapabilities = [],
  selectedOrganizationPersonalSpace = false,
}: RenderOptions = {}) => {
  const me = selectedOrganizationId
    ? ({
        selected_organization_id: selectedOrganizationId,
        organizations: [
          {
            id: selectedOrganizationId,
            personal_space: selectedOrganizationPersonalSpace,
          },
        ],
      } as Partial<meContext_fragment$data> as meContext_fragment$data)
    : undefined;

  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      PortalContext.Provider,
      {
        value: {
          me,
          hasCapability: buildHasCapability(capabilities),
          hasOrganizationCapability: buildHasOrganizationCapability(
            organizationCapabilities
          ),
        },
      },
      children
    );

  return renderHook(() => usePrivateNavigation(), { wrapper });
};

const getSection = (
  sections: ReturnType<typeof usePrivateNavigation>['sections'],
  key: string
) => sections.find((section) => section.key === key);

const getStartFreeTrialLinks = (
  sections: ReturnType<typeof usePrivateNavigation>['sections'],
  key: string
) =>
  getSection(sections, key)?.links.filter(
    (link) => link.label === 'StartFreeTrial'
  ) ?? [];

describe('usePrivateNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useIsFeatureEnabled).mockReturnValue(false);
    vi.mocked(getPrivateNavigationServiceHrefs).mockReturnValue(new Map());
    vi.mocked(
      getPrivateNavigationRegisteredPlatformsByIdentifier
    ).mockReturnValue([]);

    graphqlMocks.usePrivateNavigationServiceInstancesQuery.mockReturnValue({
      data: undefined,
    });

    graphqlMocks.usePrivateNavigationTrialEligibilityQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isPending: false,
    });
  });

  it('returns base sections and bottom links with translated labels', () => {
    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
    });

    expect(result.current.sections.map((section) => section.key)).toEqual([
      'xtm-platform',
      'opencti',
      'openaev',
      'xtm-one',
    ]);

    expect(result.current.sections.map((section) => section.label)).toEqual([
      'XTMPlatform',
      'OpenCTI',
      'OpenAEV',
      'XTM One',
    ]);

    expect(result.current.bottomLinks).toEqual([
      {
        key: 'filigran-academy',
        href: 'https://academy.filigran.io/',
        icon: expect.any(Function),
        label: 'FiligranAcademy',
        external: true,
      },
      {
        key: 'filigran-blog',
        href: 'https://filigran.io/our-blog/',
        icon: expect.any(Function),
        label: 'Blog',
        external: true,
      },
      {
        key: 'slack',
        href: 'https://filigran-community.slack.com',
        icon: expect.any(Function),
        label: 'Slack',
        external: true,
      },
    ]);
  });

  it('adds settings section immediately after xtm-one when user is authorized', () => {
    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
      capabilities: [PortalCapabilityEnum.BYPASS],
    });

    expect(result.current.sections.map((section) => section.key)).toEqual([
      'xtm-platform',
      'opencti',
      'openaev',
      'xtm-one',
      'settings',
    ]);
  });

  it('hides settings section when user has no authorized settings links', () => {
    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
      capabilities: [],
    });

    expect(getSection(result.current.sections, 'settings')).toBeUndefined();
  });

  it.each`
    capabilities                                                                   | expectedSettingsLabels
    ${[PortalCapabilityEnum.BYPASS]}                                               | ${['Parameter', 'Security', 'UseCase', 'Organization', 'Service', 'OpenCTITrial', 'OpenAEVTrial', 'Competitor', 'NewsFeed']}
    ${[PortalCapabilityEnum.READ_TRIALS]}                                          | ${['OpenCTITrial', 'OpenAEVTrial']}
    ${[PortalCapabilityEnum.MODIFY_COMPETITORS]}                                   | ${['Competitor']}
    ${[PortalCapabilityEnum.READ_TRIALS, PortalCapabilityEnum.MODIFY_COMPETITORS]} | ${['OpenCTITrial', 'OpenAEVTrial', 'Competitor']}
  `(
    'filters settings links according to portal capabilities $capabilities',
    ({ capabilities, expectedSettingsLabels }) => {
      const { result } = renderUsePrivateNavigation({
        selectedOrganizationId: 'org-1',
        capabilities,
      });

      const settingsSection = getSection(result.current.sections, 'settings');

      expect(settingsSection?.links.map((link) => link.label)).toEqual(
        expectedSettingsLabels
      );
    }
  );

  it.each`
    isCustomViewsEnabled | expectedLinkCount
    ${true}              | ${1}
    ${false}             | ${0}
  `(
    'includes Custom Views link based on feature flag ($isCustomViewsEnabled)',
    ({ isCustomViewsEnabled, expectedLinkCount }) => {
      vi.mocked(useIsFeatureEnabled).mockReturnValue(isCustomViewsEnabled);

      const { result } = renderUsePrivateNavigation({
        selectedOrganizationId: 'org-1',
      });

      const openctiSection = getSection(result.current.sections, 'opencti');
      const customViewsLinks =
        openctiSection?.links.filter((link) => link.label === 'CustomViews') ??
        [];

      expect(customViewsLinks).toHaveLength(expectedLinkCount);
    }
  );

  it('renders roadmap bottom link when roadmap service href exists', () => {
    const roadmapHref = '/app/service/xtm-platform-map';
    const serviceHrefs = new Map<ServiceDefinitionIdentifier, string>([
      [ServiceDefinitionIdentifier.XtmPlatformRoadmap, roadmapHref],
    ]);
    vi.mocked(getPrivateNavigationServiceHrefs).mockReturnValue(serviceHrefs);

    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
    });

    expect(result.current.bottomLinks).toContainEqual({
      key: 'xtm-platform-roadmap',
      href: roadmapHref,
      icon: expect.any(Function),
      label: 'XTMRoadmap',
    });
  });

  it('does not render roadmap bottom link when roadmap service href is missing', () => {
    vi.mocked(getPrivateNavigationServiceHrefs).mockReturnValue(
      new Map<ServiceDefinitionIdentifier, string>()
    );

    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
    });

    expect(
      result.current.bottomLinks.find(
        (link) => link.key === 'xtm-platform-roadmap'
      )
    ).toBeUndefined();
    expect(result.current.bottomLinks).toEqual([
      {
        key: 'filigran-academy',
        href: 'https://academy.filigran.io/',
        icon: expect.any(Function),
        label: 'FiligranAcademy',
        external: true,
      },
      {
        key: 'filigran-blog',
        href: 'https://filigran.io/our-blog/',
        icon: expect.any(Function),
        label: 'Blog',
        external: true,
      },
      {
        key: 'slack',
        href: 'https://filigran-community.slack.com',
        icon: expect.any(Function),
        label: 'Slack',
        external: true,
      },
    ]);
  });

  it('does not include StartFreeTrial links when trial data is blacklisted', () => {
    graphqlMocks.usePrivateNavigationTrialEligibilityQuery.mockReturnValue({
      data: {
        trialDeployments: {
          isBlacklisted: true,
          availableTrials: [
            PlatformIdentifier.Opencti,
            PlatformIdentifier.Openaev,
          ],
        },
      },
      isLoading: false,
      isPending: false,
    });

    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
    });

    expect(
      getStartFreeTrialLinks(result.current.sections, 'opencti')
    ).toHaveLength(0);
    expect(
      getStartFreeTrialLinks(result.current.sections, 'openaev')
    ).toHaveLength(0);
  });

  it('includes highlighted StartFreeTrial href link for available platform trial', () => {
    graphqlMocks.usePrivateNavigationTrialEligibilityQuery.mockReturnValue({
      data: {
        trialDeployments: {
          isBlacklisted: false,
          availableTrials: [PlatformIdentifier.Opencti],
        },
      },
      isLoading: false,
      isPending: false,
    });

    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
    });

    expect(getStartFreeTrialLinks(result.current.sections, 'opencti')).toEqual([
      {
        href: `/${APP_PATH}/service/opencti-free-trial`,
        label: 'StartFreeTrial',
        highlight: true,
      },
    ]);
    expect(
      getStartFreeTrialLinks(result.current.sections, 'openaev')
    ).toHaveLength(0);
  });

  it('does not include StartFreeTrial when trial data exists but platform is unavailable', () => {
    graphqlMocks.usePrivateNavigationTrialEligibilityQuery.mockReturnValue({
      data: {
        trialDeployments: {
          isBlacklisted: false,
          availableTrials: [],
        },
      },
      isLoading: false,
      isPending: false,
    });

    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
    });

    expect(
      getStartFreeTrialLinks(result.current.sections, 'opencti')
    ).toHaveLength(0);
    expect(
      getStartFreeTrialLinks(result.current.sections, 'openaev')
    ).toHaveLength(0);
  });

  it.each`
    description               | selectedOrganizationId | isLoading | isPending
    ${'organization missing'} | ${undefined}           | ${false}  | ${false}
    ${'loading'}              | ${'org-1'}             | ${true}   | ${false}
    ${'pending'}              | ${'org-1'}             | ${false}  | ${true}
  `(
    'returns highlighted label-only StartFreeTrial link when no trial data and $description',
    ({ selectedOrganizationId, isLoading, isPending }) => {
      graphqlMocks.usePrivateNavigationTrialEligibilityQuery.mockReturnValue({
        data: undefined,
        isLoading,
        isPending,
      });

      const { result } = renderUsePrivateNavigation({ selectedOrganizationId });

      expect(
        getStartFreeTrialLinks(result.current.sections, 'opencti')
      ).toEqual([
        {
          label: 'StartFreeTrial',
          highlight: true,
        },
      ]);
      expect(
        getStartFreeTrialLinks(result.current.sections, 'openaev')
      ).toEqual([
        {
          label: 'StartFreeTrial',
          highlight: true,
        },
      ]);
    }
  );

  it('does not return label-only StartFreeTrial link when organization is selected and not loading/pending', () => {
    graphqlMocks.usePrivateNavigationTrialEligibilityQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isPending: false,
    });

    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
    });

    expect(
      getStartFreeTrialLinks(result.current.sections, 'opencti')
    ).toHaveLength(0);
    expect(
      getStartFreeTrialLinks(result.current.sections, 'openaev')
    ).toHaveLength(0);
  });

  it.each`
    selectedOrganizationId | expectedEnabled | expectedOrganizationId
    ${'org-1'}             | ${true}         | ${'org-1'}
    ${undefined}           | ${false}        | ${''}
  `(
    'calls GraphQL hooks with expected variables and enabled flag for selected org ($selectedOrganizationId)',
    ({ selectedOrganizationId, expectedEnabled, expectedOrganizationId }) => {
      renderUsePrivateNavigation({ selectedOrganizationId });

      const expectedServiceVariables = {
        count: 50,
        orderBy: ServiceInstanceOrdering.Ordering,
        orderMode: OrderingMode.Asc,
      };
      const expectedTrialVariables = {
        input: {
          organizationId: expectedOrganizationId,
          platformIdentifiers: [
            PlatformIdentifier.Opencti,
            PlatformIdentifier.Openaev,
          ],
        },
      };

      expect(
        graphqlMocks.usePrivateNavigationServiceInstancesQuery
      ).toHaveBeenCalledWith(portalGraphqlClient, expectedServiceVariables, {
        queryKey: [
          'PrivateNavigationServiceInstances',
          expectedServiceVariables,
        ],
      });

      expect(
        graphqlMocks.usePrivateNavigationTrialEligibilityQuery
      ).toHaveBeenCalledWith(portalGraphqlClient, expectedTrialVariables, {
        enabled: expectedEnabled,
        queryKey: ['PrivateNavigationTrialEligibility', expectedTrialVariables],
      });
    }
  );

  it('includes MyProduct nested links after StartFreeTrial in OpenCTI and OpenAEV sections when registrations exist', () => {
    graphqlMocks.usePrivateNavigationTrialEligibilityQuery.mockReturnValue({
      data: {
        trialDeployments: {
          isBlacklisted: false,
          availableTrials: [
            PlatformIdentifier.Opencti,
            PlatformIdentifier.Openaev,
          ],
        },
      },
      isLoading: false,
      isPending: false,
    });

    vi.mocked(getPrivateNavigationRegisteredPlatformsByIdentifier)
      .mockReturnValueOnce([
        {
          serviceInstanceId: 'opencti-service-instance-id',
          title: 'OpenCTI Production Platform',
          url: 'https://opencti.example.com',
        },
      ])
      .mockReturnValueOnce([
        {
          serviceInstanceId: 'openaev-service-instance-id',
          title: 'OpenAEV Production Platform',
          url: 'https://openaev.example.com',
        },
      ]);

    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
    });

    const openctiSection = getSection(result.current.sections, 'opencti');
    const openaevSection = getSection(result.current.sections, 'openaev');

    expect(openctiSection?.links[0]).toEqual({
      href: `/${APP_PATH}/service/opencti-free-trial`,
      label: 'StartFreeTrial',
      highlight: true,
    });
    expect(openctiSection?.links[1]).toEqual({
      label: 'MyProduct',
      badge: '1',
      subLinks: [
        {
          label: 'OpenCTI Production Platform',
          href: '/app/service/opencti_registration/opencti-service-instance-id',
          tooltip: 'https://opencti.example.com',
        },
      ],
    });

    expect(openaevSection?.links[0]).toEqual({
      href: `/${APP_PATH}/service/openaev-free-trial`,
      label: 'StartFreeTrial',
      highlight: true,
    });
    expect(openaevSection?.links[1]).toEqual({
      label: 'MyProduct',
      badge: '1',
      subLinks: [
        {
          label: 'OpenAEV Production Platform',
          href: '/app/service/openaev_registration/openaev-service-instance-id',
          tooltip: 'https://openaev.example.com',
        },
      ],
    });
  });

  it('uses plural MyProduct label when more than one platform is linked', () => {
    graphqlMocks.usePrivateNavigationTrialEligibilityQuery.mockReturnValue({
      data: {
        trialDeployments: {
          isBlacklisted: false,
          availableTrials: [PlatformIdentifier.Opencti],
        },
      },
      isLoading: false,
      isPending: false,
    });

    vi.mocked(getPrivateNavigationRegisteredPlatformsByIdentifier)
      .mockReturnValueOnce([
        {
          serviceInstanceId: 'opencti-service-instance-id-1',
          title: 'OpenCTI Production Platform 1',
          url: 'https://opencti-1.example.com',
        },
        {
          serviceInstanceId: 'opencti-service-instance-id-2',
          title: 'OpenCTI Production Platform 2',
          url: 'https://opencti-2.example.com',
        },
      ])
      .mockReturnValueOnce([]);

    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
    });

    const openctiSection = getSection(result.current.sections, 'opencti');

    expect(openctiSection?.links[1]).toMatchObject({
      label: 'MyProducts',
      badge: '2',
    });
  });

  it('hides MyProduct links when no registration exists for a section', () => {
    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
    });

    const openctiSection = getSection(result.current.sections, 'opencti');
    const openaevSection = getSection(result.current.sections, 'openaev');

    expect(
      openctiSection?.links.some((link) => link.label === 'MyProduct')
    ).toBe(false);
    expect(
      openctiSection?.links.some((link) => link.label === 'MyProducts')
    ).toBe(false);
    expect(
      openaevSection?.links.some((link) => link.label === 'MyProduct')
    ).toBe(false);
    expect(
      openaevSection?.links.some((link) => link.label === 'MyProducts')
    ).toBe(false);
  });

  it.each`
    organizationCapabilities
    ${[OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION]}
    ${[OrganizationCapabilityEnum.MANAGE_ACCESS]}
  `(
    'shows Users settings link when org capability allows it',
    ({ organizationCapabilities }) => {
      const { result } = renderUsePrivateNavigation({
        selectedOrganizationId: 'org-1',
        organizationCapabilities,
        selectedOrganizationPersonalSpace: false,
      });

      const settingsSection = getSection(result.current.sections, 'settings');
      const usersLink = settingsSection?.links.find(
        (link) => link.label === 'Users'
      );

      expect(usersLink).toEqual({
        href: `/${APP_PATH}/manage/user`,
        label: 'Users',
      });
    }
  );

  it('hides Users settings link when selected organization is a personal space', () => {
    const { result } = renderUsePrivateNavigation({
      selectedOrganizationId: 'org-1',
      organizationCapabilities: [
        OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
      ],
      selectedOrganizationPersonalSpace: true,
      capabilities: [PortalCapabilityEnum.BYPASS],
    });

    const settingsSection = getSection(result.current.sections, 'settings');

    expect(settingsSection?.links.some((link) => link.label === 'Users')).toBe(
      false
    );
  });
});
