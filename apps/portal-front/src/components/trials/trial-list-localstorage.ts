import { isValueInEnum } from '@/utils/isValueInEnum';
import { DeploymentRequestOrderingEnum } from '@generated/models/DeploymentRequestOrdering.enum';
import { OrderingMode } from '@generated/trialsListQuery.graphql';
import { ColumnDef, VisibilityState } from '@tanstack/react-table';
import { useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export const useTrialsListLocalstorage = <U>(columns: ColumnDef<U>[]) => {
  const [count, setCount, removeCount] = useLocalStorage('countTrialsList', 50);
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>('orderModeTrialsList', 'asc');
  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<DeploymentRequestOrderingEnum>(
      'orderByTrialsList',
      DeploymentRequestOrderingEnum.REQUEST_DATE
    );
  useEffect(() => {
    if (!isValueInEnum(orderBy, DeploymentRequestOrderingEnum)) {
      setOrderBy(DeploymentRequestOrderingEnum.REQUEST_DATE);
    }
  }, [orderBy, setOrderBy]);
  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    'countTrialsList',
    50
  );

  const [columnOrder, setColumnOrder, removeColumnOrder] = useLocalStorage(
    'columnOrderingTrialsList',
    columns.map((c) => c.id!)
  );

  const [columnVisibility, setColumnVisibility, removeColumnVisibility] =
    useLocalStorage<VisibilityState>('columnVisibilityTrialsList', {
      registration_status: false,
      platform_url: false,
      platform_id: false,
    });

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
