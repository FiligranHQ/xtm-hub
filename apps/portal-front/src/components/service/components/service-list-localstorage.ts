import { IntegrationFeedTypeEnum } from '@generated/models/IntegrationFeedType.enum';
import { useLocalStorage } from 'usehooks-ts';

export const serviceListLocalStorage = (serviceName: string) => {
  const [count, setCount, removeCount] = useLocalStorage(
    `count${serviceName}List`,
    50
  );
  const [search, setSearch, removeSearch] = useLocalStorage<string>(
    'search',
    ''
  );

  const [labels, setLabels, removeLabels] = useLocalStorage<string[]>(
    'label',
    []
  );

  const [integrationTypes, setIntegrationTypes, removeIntegrationTypes] =
    useLocalStorage<IntegrationFeedTypeEnum[]>('integrationType', []);

  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    `count${serviceName}List`,
    50
  );

  const resetAll = () => {
    removeCount();
    removePageSize();
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
  };
};
