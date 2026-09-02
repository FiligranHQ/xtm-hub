import {
  TrialsScope,
  TrialsTabType,
  trialsScopeKey,
} from '@/components/trials/trials.const';
import { DeploymentRequestOrdering, OrderingMode } from '@graphql/generated';
import { ColumnDef, VisibilityState } from '@tanstack/react-table';
import { useLocalStorage } from 'usehooks-ts';

export const useTrialsListLocalstorage = <U>(
  columns: ColumnDef<U>[],
  type: TrialsTabType,
  scope: TrialsScope,
  defaultOrder: DeploymentRequestOrdering,
  defaultOrderMode: OrderingMode
) => {
  const suffix = `${trialsScopeKey(scope)}_${type}`;
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>(
      `orderModeTrialsList_${suffix}`,
      defaultOrderMode
    );
  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<DeploymentRequestOrdering>(
      `orderByTrialsList_${suffix}`,
      defaultOrder
    );
  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    `countTrialsList_${suffix}`,
    50
  );
  const [columnOrder, setColumnOrder, removeColumnOrder] = useLocalStorage(
    `columnOrderingTrialsList_${suffix}`,
    columns.map((c) => c.id!)
  );
  const [columnVisibility, setColumnVisibility, removeColumnVisibility] =
    useLocalStorage<VisibilityState>(`columnVisibilityTrialsList_${suffix}`, {
      registration_status: false,
      platform_url: false,
      platform_id: false,
    });

  const resetAll = () => {
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
