import { useLocalStorage } from 'usehooks-ts';
import {
  OrderingMode,
  UserOrdering,
} from '../../../../__generated__/userListQuery.graphql';

export const useUserListLocalstorage = () => {
  const [count, setCount, removeCount] = useLocalStorage('countUserList', 50);
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>('orderModeUserList', 'asc');
  const [orderBy, setOrderBy, removeOrderBy] = useLocalStorage<UserOrdering>(
    'orderByUserList',
    'email'
  );
  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    'countUserList',
    50
  );
  const [columnOrder, setColumnOrder, removeColumnOrder] = useLocalStorage<
    string[]
  >('columnOrderingUserList', []);

  const [columnVisibility, setColumnVisibility, removeColumnVisibility] =
    useLocalStorage('columnVisibilityUserList', {});

  const resetAll = () => {
    removeCount();
    removeOrderMode();
    removeOrderBy();
    removePageSize();
    removeColumnOrder();
    removeColumnVisibility();
  };

  return {
    count,
    setCount,
    orderMode,
    setOrderMode,
    orderBy,
    setOrderBy,
    pageSize,
    setPageSize,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    resetAll,
  };
};
