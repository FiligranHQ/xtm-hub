import { isValueInEnum } from '@/utils/is-value-in-enum';
import { OrderingMode, SubscriptionOrdering } from '@graphql/generated';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';

const SUBSCRIBED_SERVICES_DEFAULT_PAGE_SIZE = 50;
const SUBSCRIBED_SERVICES_PAGE_SIZES = [50, 100, 200, 300, 500];

export const normalizeSubscribedServicesPageSize = (value: number) => {
  return SUBSCRIBED_SERVICES_PAGE_SIZES.includes(value)
    ? value
    : SUBSCRIBED_SERVICES_DEFAULT_PAGE_SIZE;
};

export const useOrganizationSubscribedServicesLocalstorage = <U>(
  columns: ColumnDef<U>[]
) => {
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>(
      'orderModeOrganizationSubscribedServicesList',
      OrderingMode.Asc
    );
  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<SubscriptionOrdering>(
      'orderByOrganizationSubscribedServicesList',
      SubscriptionOrdering.StartDate
    );
  const safeOrderBy = isValueInEnum(orderBy, SubscriptionOrdering)
    ? orderBy
    : SubscriptionOrdering.StartDate;
  const safeOrderMode = isValueInEnum(orderMode, OrderingMode)
    ? orderMode
    : OrderingMode.Asc;
  useEffect(() => {
    if (!isValueInEnum(orderBy, SubscriptionOrdering)) {
      setOrderBy(SubscriptionOrdering.StartDate);
    }
  }, [orderBy, setOrderBy]);
  useEffect(() => {
    if (!isValueInEnum(orderMode, OrderingMode)) {
      setOrderMode(OrderingMode.Asc);
    }
  }, [orderMode, setOrderMode]);
  const [pageSize, setPageSize, removePageSize] = useLocalStorage<number>(
    'countOrganizationSubscribedServicesList',
    SUBSCRIBED_SERVICES_DEFAULT_PAGE_SIZE
  );
  const safePageSize = normalizeSubscribedServicesPageSize(pageSize);
  useEffect(() => {
    if (pageSize !== safePageSize) {
      setPageSize(safePageSize);
    }
  }, [pageSize, safePageSize, setPageSize]);
  const [columnOrder, setColumnOrder, removeColumnOrder] = useLocalStorage(
    'columnOrderingOrganizationSubscribedServicesList',
    columns.flatMap((column) => (column.id ? [column.id] : []))
  );
  const [columnVisibility, setColumnVisibility, removeColumnVisibility] =
    useLocalStorage('columnVisibilityOrganizationSubscribedServicesList', {});

  const removeOrder = () => {
    removeOrderBy();
    removeOrderMode();
  };

  const resetAll = () => {
    removeOrder();
    removePageSize();
    removeColumnOrder();
    removeColumnVisibility();
  };

  return {
    pageSize: safePageSize,
    setPageSize,
    orderMode: safeOrderMode,
    setOrderMode,
    orderBy: safeOrderBy,
    setOrderBy,
    removeOrder,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    resetAll,
  };
};
