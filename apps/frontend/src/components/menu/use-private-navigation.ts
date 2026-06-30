import { PortalContext } from '@/components/me/AppPortalContext';
import {
  getPrivateNavigationRegisteredPlatformsByIdentifier,
  getPrivateNavigationServiceHrefs,
} from '@/components/menu/private-navigation.utils';
import {
  BottomLink,
  SectionConfig,
  SectionLink,
} from '@/components/menu/use-navigation-type';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { APP_PATH } from '@/utils/path/constant';
import {
  HomeIcon,
  IndividualIcon,
  LogoXtmOneIcon,
  OpenAevIconIcon,
  OpenCtiIconIcon,
  PapermapIcon,
  PostIcon,
  SchoolIcon,
  SettingsIcon,
  SlackIcon,
} from '@filigran/icon';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import {
  OrderingMode,
  PlatformIdentifier,
  PrivateNavigationServiceInstancesQueryVariables,
  PrivateNavigationTrialEligibilityQueryVariables,
  ServiceDefinitionIdentifier,
  ServiceInstanceOrdering,
  usePrivateNavigationServiceInstancesQuery,
  usePrivateNavigationTrialEligibilityQuery,
} from '@graphql/generated';
import { privateNavigationKeys } from '@graphql/private-navigation/private-navigation.keys';
import { useLocale, useTranslations } from 'next-intl';
import { useContext, useMemo } from 'react';
const PRIVATE_NAVIGATION_SERVICE_INSTANCES_VARIABLES: PrivateNavigationServiceInstancesQueryVariables =
  {
    count: 50,
    orderBy: ServiceInstanceOrdering.Ordering,
    orderMode: OrderingMode.Asc,
  };
interface SettingsLinkConfig extends SectionLink {
  restriction?: PortalCapabilityEnum[];
  isVisible?: boolean;
  skipPortalCapabilityCheck?: boolean;
}
export interface PrivateNavigationConfig {
  sections: SectionConfig[];
  bottomLinks: BottomLink[];
}
export const usePrivateNavigation = (): PrivateNavigationConfig => {
  const { me, hasCapability, hasOrganizationCapability } =
    useContext(PortalContext);
  const t = useTranslations('PrivateMenu');
  const tMenuLinks = useTranslations('MenuLinks');
  const locale = useLocale();
  const selectedOrganizationId = me?.selected_organization_id;
  const currentOrganization = me?.organizations.find(
    (organization) => organization.id === selectedOrganizationId
  );
  const canManageUser =
    !!hasOrganizationCapability &&
    !currentOrganization?.personal_space &&
    (hasOrganizationCapability(
      OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION
    ) ||
      hasOrganizationCapability(OrganizationCapabilityEnum.MANAGE_ACCESS));
  const isBypass = hasCapability?.(PortalCapabilityEnum.BYPASS) ?? false;
  const settingsLinksConfig: SettingsLinkConfig[] = [
    {
      href: `/${APP_PATH}/admin/parameters`,
      label: tMenuLinks('Parameter'),
    },
    {
      href: `/${APP_PATH}/admin/user`,
      label: tMenuLinks('Security'),
    },
    {
      href: `/${APP_PATH}/admin/use-case`,
      label: tMenuLinks('UseCase'),
    },
    {
      href: `/${APP_PATH}/admin/organizations`,
      label: tMenuLinks('Organization'),
    },
    {
      href: `/${APP_PATH}/admin/service`,
      label: tMenuLinks('Service'),
    },
    {
      href: `/${APP_PATH}/admin/opencti-trials`,
      label: tMenuLinks('OpenCTITrial'),
      restriction: [PortalCapabilityEnum.READ_TRIALS],
    },
    {
      href: `/${APP_PATH}/admin/openaev-trials`,
      label: tMenuLinks('OpenAEVTrial'),
      restriction: [PortalCapabilityEnum.READ_TRIALS],
    },
    {
      href: `/${APP_PATH}/admin/competitors`,
      label: tMenuLinks('Competitor'),
      restriction: [PortalCapabilityEnum.MODIFY_COMPETITORS],
    },
    {
      href: `/${APP_PATH}/admin/news-feed`,
      label: tMenuLinks('NewsFeed'),
      restriction: [PortalCapabilityEnum.BYPASS],
    },
  ];
  const settingsLinks = settingsLinksConfig
    .filter(
      ({
        restriction = [],
        isVisible = true,
        skipPortalCapabilityCheck = false,
      }) => {
        if (!isVisible) {
          return false;
        }

        if (skipPortalCapabilityCheck) {
          return true;
        }

        if (!hasCapability) {
          return false;
        }

        return (
          restriction.some((capability) => hasCapability(capability)) ||
          isBypass
        );
      }
    )
    .map(
      ({
        restriction: _restriction,
        isVisible: _isVisible,
        skipPortalCapabilityCheck: _skipPortalCapabilityCheck,
        ...link
      }) => link
    );
  const privateNavigationTrialEligibilityVariables: PrivateNavigationTrialEligibilityQueryVariables =
    {
      input: {
        organizationId: selectedOrganizationId ?? '',
        platformIdentifiers: [
          PlatformIdentifier.Opencti,
          PlatformIdentifier.Openaev,
        ],
      },
    };
  const { data: serviceInstancesQueryData } =
    usePrivateNavigationServiceInstancesQuery(
      portalGraphqlClient,
      PRIVATE_NAVIGATION_SERVICE_INSTANCES_VARIABLES,
      {
        queryKey: privateNavigationKeys.list(
          PRIVATE_NAVIGATION_SERVICE_INSTANCES_VARIABLES
        ),
      }
    );
  const {
    data: trialEligibilityData,
    isLoading: isTrialEligibilityLoading,
    isPending: isTrialEligibilityPending,
  } = usePrivateNavigationTrialEligibilityQuery(
    portalGraphqlClient,
    privateNavigationTrialEligibilityVariables,
    {
      enabled: !!selectedOrganizationId,
      queryKey: privateNavigationKeys.trialEligibility(
        privateNavigationTrialEligibilityVariables
      ),
    }
  );
  const serviceHrefs = useMemo(
    () => getPrivateNavigationServiceHrefs(serviceInstancesQueryData),
    [serviceInstancesQueryData]
  );
  const openctiRegisteredPlatforms = useMemo(
    () =>
      getPrivateNavigationRegisteredPlatformsByIdentifier(
        serviceInstancesQueryData,
        PlatformIdentifier.Opencti
      ),
    [serviceInstancesQueryData]
  );
  const openaevRegisteredPlatforms = useMemo(
    () =>
      getPrivateNavigationRegisteredPlatformsByIdentifier(
        serviceInstancesQueryData,
        PlatformIdentifier.Openaev
      ),
    [serviceInstancesQueryData]
  );
  const trialDeployments = trialEligibilityData?.trialDeployments;
  const getStartFreeTrialLinks = (
    platformIdentifier: PlatformIdentifier,
    href: string
  ): SectionLink[] => {
    if (trialDeployments) {
      if (trialDeployments.isBlacklisted) {
        return [];
      }
      const availableTrials = trialDeployments.availableTrials.map((trial) =>
        trial.toLowerCase()
      );
      if (!availableTrials.includes(platformIdentifier.toLowerCase())) {
        return [];
      }
      return [
        {
          href,
          label: t('StartFreeTrial'),
          highlight: true,
        },
      ];
    }
    if (
      !selectedOrganizationId ||
      isTrialEligibilityLoading ||
      isTrialEligibilityPending
    ) {
      return [
        {
          label: t('StartFreeTrial'),
          highlight: true,
        },
      ];
    }
    return [];
  };
  const openctiCustomDashboardsHref = serviceHrefs.get(
    ServiceDefinitionIdentifier.OpenctiCustomDashboards
  );
  const openctiCustomViewsHref = serviceHrefs.get(
    ServiceDefinitionIdentifier.OpenctiCustomViews
  );
  const openctiIntegrationsHref = serviceHrefs.get(
    ServiceDefinitionIdentifier.OpenctiIntegrations
  );
  const openctiPlaybooksHref = serviceHrefs.get(
    ServiceDefinitionIdentifier.OpenctiPlaybooks
  );
  const openaevScenariosHref = serviceHrefs.get(
    ServiceDefinitionIdentifier.OpenaevScenarios
  );
  const xtmPlatformRoadmapHref = serviceHrefs.get(
    ServiceDefinitionIdentifier.XtmPlatformRoadmap
  );
  const getMyProductLabel = (linkedPlatformsCount: number): string =>
    linkedPlatformsCount === 1 ? t('MyProduct') : t('MyProducts');
  const openctiMyProductLinks: SectionLink[] =
    openctiRegisteredPlatforms.length > 0
      ? [
          {
            label: getMyProductLabel(openctiRegisteredPlatforms.length),
            badge: `${openctiRegisteredPlatforms.length}`,
            subLinks: openctiRegisteredPlatforms.map((platform) => ({
              label: platform.title,
              href: `/${APP_PATH}/service/opencti_registration/${platform.serviceInstanceId}`,
              tooltip: platform.url,
            })),
          },
        ]
      : [];
  const openaevMyProductLinks: SectionLink[] =
    openaevRegisteredPlatforms.length > 0
      ? [
          {
            label: getMyProductLabel(openaevRegisteredPlatforms.length),
            badge: `${openaevRegisteredPlatforms.length}`,
            subLinks: openaevRegisteredPlatforms.map((platform) => ({
              label: platform.title,
              href: `/${APP_PATH}/service/openaev_registration/${platform.serviceInstanceId}`,
              tooltip: platform.url,
            })),
          },
        ]
      : [];
  const sections: SectionConfig[] = [
    {
      key: 'xtm-platform',
      label: t('XTMPlatform'),
      icon: HomeIcon,
      pathPrefix: `/${APP_PATH}`,
      href: `/${APP_PATH}`,
      links: [],
    },
    {
      key: 'opencti',
      label: 'OpenCTI',
      icon: OpenCtiIconIcon,
      pathPrefix: `/${APP_PATH}/service/opencti`,
      links: [
        ...getStartFreeTrialLinks(
          PlatformIdentifier.Opencti,
          `/${APP_PATH}/service/opencti-free-trial`
        ),
        ...openctiMyProductLinks,
        {
          href: openctiCustomDashboardsHref,
          label: t('CustomDashboards'),
        },
        {
          href: openctiCustomViewsHref,
          label: t('CustomViews'),
        },
        {
          href: openctiIntegrationsHref,
          label: t('Integrations'),
        },
        {
          href: openctiPlaybooksHref,
          label: t('Playbooks'),
        },
        {
          href: 'https://demo.opencti.io',
          label: t('LiveDemo'),
          external: true,
        },
        {
          href: 'https://docs.opencti.io/latest/',
          label: t('Documentation'),
          external: true,
        },
      ],
    },
    {
      key: 'openaev',
      label: 'OpenAEV',
      icon: OpenAevIconIcon,
      pathPrefix: `/${APP_PATH}/service/openaev`,
      links: [
        ...getStartFreeTrialLinks(
          PlatformIdentifier.Openaev,
          `/${APP_PATH}/service/openaev-free-trial`
        ),
        ...openaevMyProductLinks,
        {
          href: openaevScenariosHref,
          label: t('Scenarios'),
        },
        {
          href: 'https://demo.openaev.io',
          label: t('LiveDemo'),
          external: true,
        },
        {
          href: 'https://docs.openaev.io/latest',
          label: t('Documentation'),
          external: true,
        },
      ],
    },
    {
      key: 'xtm-one',
      label: 'XTM One',
      icon: LogoXtmOneIcon,
      pathPrefix: `/${locale}/cybersecurity-solutions/xtm-one`,
      links: [
        {
          href: 'https://filigran.io/platform/xtm-one/',
          label: t('About'),
          external: true,
        },
        { label: t('AICatalog'), badge: t('ComingSoon') },
      ],
    },
    ...(canManageUser
      ? [
          {
            key: 'users',
            label: tMenuLinks('Users'),
            icon: IndividualIcon,
            pathPrefix: `/${APP_PATH}/manage/user`,
            href: `/${APP_PATH}/manage/user`,
            links: [],
          },
        ]
      : []),
    ...(settingsLinks.length > 0
      ? [
          {
            key: 'settings',
            label: tMenuLinks('Settings'),
            icon: SettingsIcon,
            pathPrefix: `/${APP_PATH}/admin/`,
            links: settingsLinks,
          },
        ]
      : []),
  ];
  const bottomLinks: BottomLink[] = [
    ...(xtmPlatformRoadmapHref
      ? [
          {
            key: 'xtm-platform-roadmap',
            href: xtmPlatformRoadmapHref,
            icon: PapermapIcon,
            label: t('XTMRoadmap'),
          },
        ]
      : []),
    {
      key: 'filigran-academy',
      href: 'https://academy.filigran.io/',
      icon: SchoolIcon,
      label: t('FiligranAcademy'),
      external: true,
    },
    {
      key: 'filigran-blog',
      href: 'https://filigran.io/our-blog/',
      icon: PostIcon,
      label: t('Blog'),
      external: true,
    },
    {
      key: 'slack',
      href: 'https://filigran-community.slack.com',
      icon: SlackIcon,
      label: t('Slack'),
      external: true,
    },
  ];
  return { sections, bottomLinks };
};
