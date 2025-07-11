import { ColumnSort } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';

interface ColumnSortValue<T, U> extends ColumnSort {
  count: number;
  cursor?: string | null;
  orderBy: T;
  orderMode: U;
}

type OrderingMode = 'asc' | 'desc';

interface HandleSortingChangeParams<T> {
  handleRefetchData: (args: Record<string, unknown>) => void;
  orderBy: string;
  orderMode: OrderingMode;
  removeOrder: () => void;
  setOrderBy: Dispatch<SetStateAction<T>>;
  setOrderMode: (orderMode: OrderingMode) => void;
  updater: unknown;
}

export const handleSortingChange = <T>({
  updater,
  orderBy,
  orderMode,
  setOrderBy,
  setOrderMode,
  removeOrder,
  handleRefetchData,
}: HandleSortingChangeParams<T>) => {
  const sorting = mapToSortingTableValue(orderBy, orderMode);
  const newSortingValue =
    updater instanceof Function ? updater(sorting) : updater;
  if (!newSortingValue[0]) {
    removeOrder();
  } else {
    setOrderBy(newSortingValue[0].id);
    setOrderMode(newSortingValue[0].desc ? 'desc' : 'asc');
  }

  handleRefetchData(
    transformSortingValueToParams<T, OrderingMode>(newSortingValue)
  );
};

export const transformSortingValueToParams = <T, U>(
  sortingValue?: ColumnSort[]
): Partial<ColumnSortValue<T, U>> => {
  if (!sortingValue?.[0]) {
    return {};
  }

  const { id, desc } = sortingValue[0];
  const mode = desc ? 'desc' : 'asc';

  return { orderBy: id as T, orderMode: mode as U };
};

export const mapToSortingTableValue = <T, U>(orderBy: T, orderMode: U) => {
  return [
    {
      id: orderBy,
      desc: orderMode === 'desc',
    },
  ];
};
