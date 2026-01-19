import { ServiceListFilterKey } from '@/components/service/components/header/service-list-header';
import { LogicalMultiSelectSelection } from '@/components/ui/shareable-resource/logical-multi-select-form-field';
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

  const [labels, setLabels, removeLabels] =
    useLocalStorage<LogicalMultiSelectSelection>(`label${serviceName}List`, {});

  const [selectedFilters, setSelectedFilters, removeSelectedFilters] =
    useLocalStorage<ServiceListFilterKey[]>(
      `selectedFilters${serviceName}List`,
      []
    );

  const [integrationTypes, setIntegrationTypes, removeIntegrationTypes] =
    useLocalStorage<LogicalMultiSelectSelection>(
      `integrationType${serviceName}List`,
      {}
    );

  const [productVersions, setProductVersions, removeProductVersions] =
    useLocalStorage<LogicalMultiSelectSelection>(
      `productVersion${serviceName}List`,
      {}
    );

  const [deployable, setDeployable, removeDeployable] =
    useLocalStorage<LogicalMultiSelectSelection>(
      `deployable${serviceName}List`,
      {}
    );

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
