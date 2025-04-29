import { useLocalStorage } from 'usehooks-ts';

export const csvFeedListLocalStorage = () => {
  const [count, setCount, removeCount] = useLocalStorage(
    'countCsvFeedList',
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
    'countCsvFeedList',
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
