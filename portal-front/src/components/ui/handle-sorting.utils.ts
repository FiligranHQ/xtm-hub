import { ColumnSort } from '@tanstack/react-table';

interface ColumnSortValue<T, U> extends ColumnSort {
  count: number;
  cursor?: string | null;
  orderBy: T;
  orderMode: U;
}

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
