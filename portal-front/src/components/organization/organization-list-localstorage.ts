import { OrganizationOrderingEnum } from '@generated/models/OrganizationOrdering.enum';
import { OrderingMode } from '@generated/organizationSelectQuery.graphql';
import { ColumnDef } from '@tanstack/react-table';
import { useLocalStorage } from 'usehooks-ts';

export const useOrganizationListLocalstorage = <U>(columns: ColumnDef<U>[]) => {
  const [count, setCount, removeCount] = useLocalStorage(
    'countOrganizationList',
    50
  );
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>('orderModeOrganizationList', 'asc');
  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<OrganizationOrderingEnum>(
      'orderByOrganizationList',
      OrganizationOrderingEnum.NAME
    );
  const organizationOrderingValues = Object.values(OrganizationOrderingEnum);
  if (!organizationOrderingValues.includes(orderBy)) {
    setOrderBy(OrganizationOrderingEnum.NAME);
  }
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
    removeOrder,
    pageSize,
    setPageSize,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    resetAll,
  };
};
