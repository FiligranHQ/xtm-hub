import { ColumnDef } from '@tanstack/react-table';
import { useLocalStorage } from 'usehooks-ts';
import {
  OrderingMode,
  OrganizationOrdering,
} from '../../../__generated__/organizationSelectQuery.graphql';

export const useOrganizationListLocalstorage = <U>(columns: ColumnDef<U>[]) => {
  const [count, setCount, removeCount] = useLocalStorage(
    'countOrganizationList',
    50
  );
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>('orderModeOrganizationList', 'asc');
  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<OrganizationOrdering>('orderByOrganizationList', 'name');
  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    'countOrganizationList',
    50
  );

  const [columnOrder, setColumnOrder, removeColumnOrder] = useLocalStorage(
    'columnOrderingOrganizationList',
    columns.map((c) => c.id!)
  );

  const [columnVisibility, setColumnVisibility, removeColumnVisibility] =
    useLocalStorage('columnVisibilityOrganizationList', {});

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
