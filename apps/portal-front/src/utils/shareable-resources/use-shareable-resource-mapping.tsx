'use client';
import { ServiceListFilterLabel } from '@/components/service/components/header/filter/service-list-filter-label';
import {
  ServiceListFilterKey,
  ServiceListFilterMap,
} from '@/components/service/components/header/service-list-header';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import { IntegrationFeedDeployableFilter } from '@/components/ui/shareable-resource/integration-feed/integration-feed-deployable-filter';
import { IntegrationFeedFilters } from '@/components/ui/shareable-resource/integration-feed/integration-feed-filters';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';

export const useShareableResourceMapping = (slug: ServiceSlug) => {
  const localStorageKeyMapping: Record<
    ServiceSlug,
    ServiceListLocalStorageKey
  > = {
    [ServiceSlug.OPEN_CTI_INTEGRATION_FEEDS]:
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds,
    [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]:
      ServiceListLocalStorageKey.OpenCTICustomDashboards,
    [ServiceSlug.OPEN_AEV_SCENARIOS]:
      ServiceListLocalStorageKey.OpenAEVScenarios,
  };
  const localStorageKey = localStorageKeyMapping[slug];

  const {
    removeLabels,
    removeConnectorTypes,
    removeIntegrationTypes,
    removeDeployable,
  } = useServiceListLocalStorage(localStorageKey);

  const labelFilter = {
    node: <ServiceListFilterLabel />,
    reset: removeLabels,
  };

  const filtersMap: Record<ServiceSlug, ServiceListFilterMap> = {
    [ServiceSlug.OPEN_CTI_INTEGRATION_FEEDS]: {
      [ServiceListFilterKey.Label]: labelFilter,
      [ServiceListFilterKey.IntegrationFeedType]: {
        node: <IntegrationFeedFilters />,
        reset: () => {
          removeConnectorTypes();
          removeIntegrationTypes();
        },
      },
      [ServiceListFilterKey.ManagerSupported]: {
        node: <IntegrationFeedDeployableFilter />,
        reset: removeDeployable,
      },
    },
    [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]: {
      [ServiceListFilterKey.Label]: labelFilter,
    },
    [ServiceSlug.OPEN_AEV_SCENARIOS]: {
      [ServiceListFilterKey.Label]: labelFilter,
    },
  };

  const filters = filtersMap[slug];

  return {
    filters,
    localStorageKey,
  };
};
