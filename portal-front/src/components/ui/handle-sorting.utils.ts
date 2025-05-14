import { OrderingMode } from '@generated/OrganizationsPaginationQuery.graphql';
import { ColumnSort } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';

interface ColumnSortValue<T, U> extends ColumnSort {
  count: number;
  cursor?: string | null;
  orderBy: T;
  orderMode: U;
}

interface HandleSortingChangeParams<Ordering> {
  handleRefetchData: (args: Record<string, unknown>) => void;
  orderBy: string;
  orderMode: OrderingMode;
  removeOrderBy: () => void;
  setOrderBy: Dispatch<SetStateAction<Ordering>>;
  setOrderMode: (orderMode: OrderingMode) => void;
  updater: unknown;
}

export const handleSortingChange = <O>({
  updater,
  orderBy,
  orderMode,
  setOrderBy,
  setOrderMode,
  removeOrderBy,
  handleRefetchData,
}: HandleSortingChangeParams<O>) => {
  const sorting = mapToSortingTableValue(orderBy, orderMode);
  const newSortingValue =
    updater instanceof Function ? updater(sorting) : updater;
  if (!newSortingValue[0]) {
    removeOrderBy();
  } else {
    setOrderBy(newSortingValue[0].id);
    setOrderMode(newSortingValue[0].desc ? 'desc' : 'asc');
  }

  handleRefetchData(
    transformSortingValueToParams<O, OrderingMode>(newSortingValue)
  );
};

export const transformSortingValueToParams = <T, U>(
  sortingValue?: ColumnSort[]
): Partial<ColumnSortValue<T, U>> => {
  if (sortingValue && sortingValue[0]) {
    const { id, desc } = sortingValue[0];
    if (desc) {
      return { orderBy: id as T, orderMode: 'desc' as U };
    } else return { orderBy: id as T, orderMode: 'asc' as U };
  }
  return {};
};

export const mapToSortingTableValue = <T, U>(orderBy: T, orderMode: U) => {
  return [
    {
      id: orderBy,
      desc: orderMode === 'desc',
    },
  ];
};
