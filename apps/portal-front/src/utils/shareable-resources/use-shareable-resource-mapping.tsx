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
import { IntegrationDeployableFilter } from '@/components/ui/shareable-resource/integration/integration-deployable-filter';
import { IntegrationFilters } from '@/components/ui/shareable-resource/integration/integration-filters';
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
    [ServiceSlug.OPEN_AEV_SCENARIOS]:
      ServiceListLocalStorageKey.OpenAEVScenarios,
  };
  const localStorageKey = localStorageKeyMapping[slug];
  const typeFeed: Record<ServiceSlug, ShareableResourceType> = {
    [ServiceSlug.OPEN_CTI_INTEGRATIONS]:
      ShareableResourceType.OPENCTI_INTEGRATION,
    [ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS]:
      ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD,
    [ServiceSlug.OPEN_AEV_SCENARIOS]: ShareableResourceType.OPENAEV_SCENARIO,
  };
  const { removeLabels, removeIntegrationTypes, removeDeployable } =
    useServiceListLocalStorage(localStorageKey);

  const labelFilter = {
    node: <ServiceListFilterLabel type={typeFeed[slug]} />,
    reset: removeLabels,
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
