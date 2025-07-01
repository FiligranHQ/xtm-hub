import { useLocalStorage } from 'usehooks-ts';

export const obasScenarioListLocalStorage = () => {
  const [count, setCount, removeCount] = useLocalStorage(
    'countObasScenarioList',
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

  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    'countObasScenarioList',
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
  };
};
