import { isValueInEnum } from '@/utils/isValueInEnum';
import { UserOrderingEnum } from '@generated/models/UserOrdering.enum';
import { OrderingMode } from '@generated/userListQuery.graphql';
import { useLocalStorage } from 'usehooks-ts';

export const useUserListLocalstorage = () => {
  const [count, setCount, removeCount] = useLocalStorage(
    'countPendingUserList',
    50
  );
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>('orderModePendingUserList', 'asc');
  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<UserOrderingEnum>(
      'orderByPendingUserList',
      UserOrderingEnum.EMAIL
    );

  if (!isValueInEnum(orderBy, UserOrderingEnum)) {
    setOrderBy(UserOrderingEnum.EMAIL);
  }
  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    'countPendingUserList',
    50
  );
  const [columnOrder, setColumnOrder, removeColumnOrder] = useLocalStorage<
    string[]
  >('columnOrderingPendingUserList', []);

  const [columnVisibility, setColumnVisibility, removeColumnVisibility] =
    useLocalStorage('columnVisibilityPendingUserList', {});

  const resetAll = () => {
    removeCount();
    removeOrderMode();
    removeOrderBy();
    removePageSize();
    removeColumnOrder();
    removeColumnVisibility();
  };

  const removeOrder = () => {
    removeOrderBy();
    removeOrderMode();
  };

  return {
    count,
    setCount,
    orderMode,
    setOrderMode,
    orderBy,
    setOrderBy,
    removeOrderBy,
    pageSize,
    setPageSize,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    resetAll,
    removeOrder,
  };
};
