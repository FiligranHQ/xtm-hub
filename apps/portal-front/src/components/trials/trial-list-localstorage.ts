import { DeploymentRequestOrderingEnum } from '@generated/models/DeploymentRequestOrdering.enum';
import { OrderingMode } from '@generated/trialsListQuery.graphql';
import { ColumnDef } from '@tanstack/react-table';
import { useLocalStorage } from 'usehooks-ts';

export const useTrialsListLocalstorage = <U>(columns: ColumnDef<U>[]) => {
  const [count, setCount, removeCount] = useLocalStorage('countTrialsList', 50);
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>('orderModeTrialsList', 'asc');
  const [orderBy, setOrderBy, removeOrderBy] = useLocalStorage<
    DeploymentRequestOrderingEnum | undefined
  >('orderByTrialsList', undefined);
  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    'countTrialsList',
    50
  );

  const [columnOrder, setColumnOrder, removeColumnOrder] = useLocalStorage(
    'columnOrderingTrialsList',
    columns.map((c) => c.id!)
  );

  const [columnVisibility, setColumnVisibility, removeColumnVisibility] =
    useLocalStorage('columnVisibilityTrialsList', {});

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
