import { NumberFormat } from '@/utils/numberFormat';
import * as R from 'ramda';
import { useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export default (key: string, initialValue: Record<string, unknown>) => {
  const [viewStorage, setValue] = useLocalStorage(key, initialValue);

  const helpers = {
    handleAddProperty: (field: string, value: unknown) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (!R.equals(viewStorage[field], value)) {
        const newValue = {
          ...viewStorage,
          [field]: value,
        };
        setValue(newValue);
      }
    },
    handleSearch: (value: string) => {
      const newValue = {
        ...viewStorage,
        searchTerm: value,
      };
      setValue(newValue);
    },
    handleAddFilterWithEmptyValue: () => {},
    handleSetNumberOfElements: (nbElements: Partial<NumberFormat>) => {
      if (
        nbElements?.original !==
        (viewStorage.numberOfElements as NumberFormat)?.original
      ) {
        const { number, symbol, original } = nbElements;
        const newValue = {
          ...viewStorage,
          numberOfElements: {
            ...(viewStorage.numberOfElements as NumberFormat),
            ...(number ? { number } : { number: 0 }),
            ...(symbol ? { symbol } : { symbol: '' }),
            ...(original ? { original } : { original: 0 }),
          },
        };
        setValue(newValue);
      }
    },
    handleSort: (field: string, order: boolean) => {
      const newValue = {
        ...viewStorage,
        orderBy: field,
        orderAsc: order,
      };
      setValue(newValue);
    },
  };

  const paginationOptions = useMemo(
    () => ({
      orderBy: viewStorage.orderBy,
      searchTerm: !!viewStorage.searchTerm ? viewStorage.searchTerm : undefined,
      filters: viewStorage.filters,
      orderMode: viewStorage.orderAsc ? 'asc' : 'desc',
    }),
    [viewStorage]
  );

  return {
    viewStorage,
    helpers,
    paginationOptions,
    localStorageKey: key,
  };
};
