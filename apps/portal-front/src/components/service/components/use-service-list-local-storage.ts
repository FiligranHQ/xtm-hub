import { ServiceListFilterKey } from '@/components/service/components/header/service-list-header';
import { IntegrationSubTypeEnum } from '@generated/models/IntegrationSubType.enum';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useLocalStorage } from 'usehooks-ts';

export enum ServiceListLocalStorageKey {
  OpenCTICustomDashboards = 'OpenCTICustomDashboards',
  OpenCTIIntegrationFeeds = 'OpenCTIIntegrationFeeds',
  OpenAEVScenarios = 'OpenAEVScenarios',
}

export const useServiceListLocalStorage = (
  serviceName: ServiceListLocalStorageKey
) => {
  const [count, setCount, removeCount] = useLocalStorage(
    `count${serviceName}List`,
    50
  );

  const [search, setSearch, removeSearch] = useLocalStorage<string>(
    `search${serviceName}List`,
    ''
  );

  const [labels, setLabels, removeLabels] = useLocalStorage<string[]>(
    `label${serviceName}List`,
    []
  );

  const [selectedFilters, setSelectedFilters, removeSelectedFilters] =
    useLocalStorage<ServiceListFilterKey[]>(
      `selectedFilters${serviceName}List`,
      []
    );

  const [integrationTypes, setIntegrationTypes, removeIntegrationTypes] =
    useLocalStorage<IntegrationTypeEnum[]>(
      `integrationType${serviceName}List`,
      []
    );

  const [
    integrationSubTypes,
    setIntegrationSubTypes,
    removeIntegrationSubTypes,
  ] = useLocalStorage<IntegrationSubTypeEnum[]>(
    `integrationSubType${serviceName}List`,
    []
  );

  const [productVersions, setProductVersions, removeProductVersions] =
    useLocalStorage<string[]>(`productVersion${serviceName}List`, []);

  const [deployable, setDeployable, removeDeployable] = useLocalStorage<
    string[]
  >(`deployable${serviceName}List`, []);

  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    `count${serviceName}List`,
    50
  );

  const resetAll = () => {
    removeCount();
    removePageSize();
    removeSearch();
    removeLabels();
    removeSelectedFilters();
    removeIntegrationTypes();
    removeIntegrationSubTypes();
    removeDeployable();
  };

  return {
    count,
    setCount,
    pageSize,
    setPageSize,
    resetAll,
    search,
    setSearch,
    removeSearch,
    labels,
    setLabels,
    removeLabels,
    integrationTypes,
    setIntegrationTypes,
    removeIntegrationTypes,
    integrationSubTypes,
    setIntegrationSubTypes,
    removeIntegrationSubTypes,
    selectedFilters,
    setSelectedFilters,
    removeSelectedFilters,
    productVersions,
    setProductVersions,
    removeProductVersions,
    deployable,
    setDeployable,
    removeDeployable,
  };
};
