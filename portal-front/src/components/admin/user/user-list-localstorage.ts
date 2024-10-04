import { UserData } from '@/components/admin/user/user-list';
import { ColumnDef } from '@tanstack/react-table';
import { useLocalStorage } from 'usehooks-ts';
import {
  OrderingMode,
  UserOrdering,
} from '../../../../__generated__/userQuery.graphql';

export const useUserListLocalstorage = (columns: ColumnDef<UserData>[]) => {
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
  const [columnOrder, setColumnOrder, removeColumnOrder] = useLocalStorage(
    'columnOrderingUserList',
    columns.map((c) => c.id!)
  );

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
