import { UserOrderingEnum } from '@generated/models/UserOrdering.enum';
import { OrderingMode } from '@generated/UserListQuery.graphql';
import { useLocalStorage } from 'usehooks-ts';
import { isValueInEnum } from '../../../utils/is-value-in-enum';

export const useUserListLocalstorage = () => {
  const [count, setCount, removeCount] = useLocalStorage('countUserList', 50);
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>('orderModeUserList', 'asc');
  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<UserOrderingEnum>(
      'orderByUserList',
      UserOrderingEnum.EMAIL
    );

  if (!isValueInEnum(orderBy, UserOrderingEnum)) {
    setOrderBy(UserOrderingEnum.EMAIL);
  }
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
