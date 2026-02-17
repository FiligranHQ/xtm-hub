import { TrialsTabType } from '@/components/trials/trials.const';
import { DeploymentRequestOrderingEnum } from '@generated/models/DeploymentRequestOrdering.enum';
import { OrderingMode } from '@generated/trialsListQuery.graphql';
import { ColumnDef, VisibilityState } from '@tanstack/react-table';
import { useLocalStorage } from 'usehooks-ts';

export const useTrialsListLocalstorage = <U>(
  columns: ColumnDef<U>[],
  type: TrialsTabType,
  defaultOrder: DeploymentRequestOrderingEnum,
  defaultOrderMode: OrderingMode
) => {
  const [count, setCount, removeCount] = useLocalStorage(
    `countTrialsList_${type}`,
    50
  );
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>(
      `orderModeTrialsList_${type}`,
      defaultOrderMode
    );
  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<DeploymentRequestOrderingEnum>(
      `orderByTrialsList_${type}`,
      defaultOrder
    );
  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    `countTrialsList_${type}`,
    50
  );

  const [columnOrder, setColumnOrder, removeColumnOrder] = useLocalStorage(
    `columnOrderingTrialsList_${type}`,
    columns.map((c) => c.id!)
  );

  const [columnVisibility, setColumnVisibility, removeColumnVisibility] =
    useLocalStorage<VisibilityState>(`columnVisibilityTrialsList_${type}`, {
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
