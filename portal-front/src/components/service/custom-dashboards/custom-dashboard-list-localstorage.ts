import { useLocalStorage } from 'usehooks-ts';

export const customDashboardListLocalStorage = () => {
  const [count, setCount, removeCount] = useLocalStorage(
    'countDocumentList',
    50
  );
  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    'countCustomDashboardList',
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
  };
};
