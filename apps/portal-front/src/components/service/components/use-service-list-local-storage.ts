import { ServiceListFilterKey } from '@/components/service/components/header/service-list-header';
import { ConnectorTypeEnum } from '@generated/models/ConnectorType.enum';
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

  const [connectorTypes, setConnectorTypes, removeConnectorTypes] =
    useLocalStorage<ConnectorTypeEnum[]>(`connectorType${serviceName}List`, []);

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
    removeConnectorTypes();
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
    connectorTypes,
    setConnectorTypes,
    removeConnectorTypes,
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
