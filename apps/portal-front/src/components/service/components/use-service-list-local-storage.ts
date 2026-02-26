import { ServiceListFilterKey } from '@/components/service/components/header/service-list-header';
import {
  isLogicalMultiSelectSelection,
  LogicalMultiSelectSelection,
} from '@/components/ui/shareable-resource/logical-multi-select/logical-multi-select-form-field';
import usePublicPath from '@/hooks/usePublicPath';
import { DocumentOrderingEnum } from '@generated/models/DocumentOrdering.enum';
import { OrderingModeEnum } from '@generated/models/OrderingMode.enum';
import { useLocalStorage } from 'usehooks-ts';

export enum ServiceListLocalStorageKey {
  OpenCTICustomDashboards = 'OpenCTICustomDashboards',
  OpenCTIIntegrationFeeds = 'OpenCTIIntegrationFeeds',
  OpenAEVScenarios = 'OpenAEVScenarios',
}

const deserializeSelectedFilters = (stored: string): ServiceListFilterKey[] => {
  try {
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

    const validValues = Object.values(ServiceListFilterKey);

    return parsed.filter((item): item is ServiceListFilterKey =>
      validValues.includes(item)
    );
  } catch {
    return [];
  }
};

const deserializeLogicalMultiSelectSelection = (
  stored: string
): LogicalMultiSelectSelection => {
  try {
    const parsed = JSON.parse(stored);

    if (isLogicalMultiSelectSelection(parsed)) {
      return parsed;
    }

    return {};
  } catch {
    return {};
  }
};

export const useServiceListLocalStorage = (
  serviceName: ServiceListLocalStorageKey
) => {
  const isPublicPath = usePublicPath();
  const pagePrefix = isPublicPath ? 'Public' : 'Private';
  const [count, setCount, removeCount] = useLocalStorage(
    `count${pagePrefix}${serviceName}List`,
    50
  );

  const [search, setSearch, removeSearch] = useLocalStorage<string>(
    `search${pagePrefix}${serviceName}List`,
    ''
  );

  const [labels, setLabels, removeLabels] =
    useLocalStorage<LogicalMultiSelectSelection>(
      `label${pagePrefix}${serviceName}List`,
      {},
      {
        deserializer: deserializeLogicalMultiSelectSelection,
      }
    );

  const [selectedFilters, setSelectedFilters, removeSelectedFilters] =
    useLocalStorage<ServiceListFilterKey[]>(
      `selectedFilters${pagePrefix}${serviceName}List`,
      [],
      {
        deserializer: deserializeSelectedFilters,
      }
    );

  const [integrationTypes, setIntegrationTypes, removeIntegrationTypes] =
    useLocalStorage<LogicalMultiSelectSelection>(
      `integrationType${pagePrefix}${serviceName}List`,
      {},
      {
        deserializer: deserializeLogicalMultiSelectSelection,
      }
    );

  const [productVersions, setProductVersions, removeProductVersions] =
    useLocalStorage<LogicalMultiSelectSelection>(
      `productVersion${pagePrefix}${serviceName}List`,
      {},
      {
        deserializer: deserializeLogicalMultiSelectSelection,
      }
    );

  const [deployable, setDeployable, removeDeployable] =
    useLocalStorage<LogicalMultiSelectSelection>(
      `deployable${pagePrefix}${serviceName}List`,
      {},
      {
        deserializer: deserializeLogicalMultiSelectSelection,
      }
    );

  const [verified, setVerified, removeVerified] =
    useLocalStorage<LogicalMultiSelectSelection>(
      `verified${pagePrefix}${serviceName}List`,
      {},
      {
        deserializer: deserializeLogicalMultiSelectSelection,
      }
    );

  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    `count${pagePrefix}${serviceName}List`,
    50
  );

  const defaultOrderBy =
    serviceName === ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
      ? DocumentOrderingEnum.NAME
      : DocumentOrderingEnum.CREATED_AT;

  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<DocumentOrderingEnum>(
      `orderBy${pagePrefix}${serviceName}List`,
      defaultOrderBy
    );

  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingModeEnum>(
      `orderMode${pagePrefix}${serviceName}List`,
      OrderingModeEnum.ASC
    );

  const resetAll = () => {
    removeCount();
    removePageSize();
    removeSearch();
    removeLabels();
    removeSelectedFilters();
    removeIntegrationTypes();
    removeDeployable();
    removeOrderBy();
    removeOrderMode();
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
    verified,
    setVerified,
    removeVerified,
    orderBy,
    setOrderBy,
    orderMode,
    setOrderMode,
  };
};
