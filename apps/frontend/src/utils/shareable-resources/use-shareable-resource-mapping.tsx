'use client';
import { ServiceListFilterEntityType } from '@/components/service/components/header/filter/ServiceListFilterEntityType';
import { ServiceListFilterLabel } from '@/components/service/components/header/filter/ServiceListFilterLabel';
import {
  ServiceListFilterKey,
  ServiceListFilterMap,
} from '@/components/service/components/header/ServiceListHeader';
import { IntegrationDeployableFilter } from '@/components/ui/shareable-resource/integration/IntegrationDeployableFilter';
import { IntegrationFilters } from '@/components/ui/shareable-resource/integration/IntegrationFilters';
import { IntegrationVerifiedFilter } from '@/components/ui/shareable-resource/integration/IntegrationVerifiedFilter';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
import {
  ServiceSlug,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';

export const useShareableResourceMapping = (slug: ServiceSlug) => {
  const localStorageKeyMapping: Record<
    ServiceSlug,
    ServiceListLocalStorageKey
  > = {
    [ServiceSlug.OPEN_CTI_INTEGRATIONS]:
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds,
    [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]:
      ServiceListLocalStorageKey.OpenCTICustomDashboards,
    [ServiceSlug.OPEN_CTI_CUSTOM_VIEWS]:
      ServiceListLocalStorageKey.OpenCTICustomViews,
    [ServiceSlug.OPEN_AEV_SCENARIOS]:
      ServiceListLocalStorageKey.OpenAEVScenarios,
    [ServiceSlug.OPEN_CTI_PLAYBOOKS]:
      ServiceListLocalStorageKey.OpenCTIPlaybooks,
  };
  const localStorageKey = localStorageKeyMapping[slug];
  const typeFeed: Record<ServiceSlug, ShareableResourceType> = {
    [ServiceSlug.OPEN_CTI_INTEGRATIONS]:
      ShareableResourceType.OPENCTI_INTEGRATION,
    [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]:
      ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD,
    [ServiceSlug.OPEN_CTI_CUSTOM_VIEWS]:
      ShareableResourceType.OPENCTI_CUSTOM_VIEW,
    [ServiceSlug.OPEN_AEV_SCENARIOS]: ShareableResourceType.OPENAEV_SCENARIO,
    [ServiceSlug.OPEN_CTI_PLAYBOOKS]: ShareableResourceType.OPENCTI_PLAYBOOK,
  };
  const {
    removeLabels,
    removeIntegrationTypes,
    removeDeployable,
    removeVerified,
    removeEntityTypes,
  } = useServiceListLocalStorage(localStorageKey);

  const labelFilter = {
    node: <ServiceListFilterLabel type={typeFeed[slug]} />,
    reset: removeLabels,
  };

  const entityTypeFilter = {
    node: <ServiceListFilterEntityType />,
    reset: removeEntityTypes,
  };

  const filtersMap: Record<ServiceSlug, ServiceListFilterMap> = {
    [ServiceSlug.OPEN_CTI_INTEGRATIONS]: {
      [ServiceListFilterKey.Label]: labelFilter,
      [ServiceListFilterKey.IntegrationType]: {
        node: <IntegrationFilters />,
        reset: removeIntegrationTypes,
      },
      [ServiceListFilterKey.ManagerSupported]: {
        node: <IntegrationDeployableFilter />,
        reset: removeDeployable,
      },
      [ServiceListFilterKey.Verified]: {
        node: <IntegrationVerifiedFilter />,
        reset: removeVerified,
      },
    },
    [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]: {
      [ServiceListFilterKey.Label]: labelFilter,
    },
    [ServiceSlug.OPEN_CTI_CUSTOM_VIEWS]: {
      [ServiceListFilterKey.Label]: labelFilter,
      [ServiceListFilterKey.EntityType]: entityTypeFilter,
    },
    [ServiceSlug.OPEN_AEV_SCENARIOS]: {
      [ServiceListFilterKey.Label]: labelFilter,
    },
    [ServiceSlug.OPEN_CTI_PLAYBOOKS]: {
      [ServiceListFilterKey.Label]: labelFilter,
    },
  };

  const filters = filtersMap[slug];

  return {
    filters,
    localStorageKey,
  };
};
