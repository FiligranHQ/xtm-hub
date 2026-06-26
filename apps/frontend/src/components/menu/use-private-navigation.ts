import { PortalContext } from '@/components/me/AppPortalContext';
import { getPrivateNavigationServiceHrefs } from '@/components/menu/private-navigation.utils';
import {
  BottomLink,
  SectionConfig,
  SectionLink,
} from '@/components/menu/use-navigation-type';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { APP_PATH } from '@/utils/path/constant';
import {
  HomeIcon,
  LogoXtmOneIcon,
  OpenAevIconIcon,
  OpenCtiIconIcon,
  PapermapIcon,
  PostIcon,
  SchoolIcon,
  SlackIcon,
} from '@filigran/icon';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
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

export interface PrivateNavigationConfig {
  sections: SectionConfig[];
  bottomLinks: BottomLink[];
}

export const usePrivateNavigation = (): PrivateNavigationConfig => {
  const { me } = useContext(PortalContext);
  const t = useTranslations('PrivateMenu');
  const locale = useLocale();
  const selectedOrganizationId = me?.selected_organization_id;
  const isCustomViewsEnabled = useIsFeatureEnabled(
    FeatureFlagEnum.OPENCTI_CUSTOM_VIEWS
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
        {
          href: openctiCustomDashboardsHref,
          label: t('CustomDashboards'),
        },
        ...(isCustomViewsEnabled
          ? [
              {
                href: openctiCustomViewsHref,
                label: t('CustomViews'),
              },
            ]
          : []),
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
