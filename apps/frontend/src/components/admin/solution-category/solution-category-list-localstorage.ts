import { OrderingMode, SolutionCategoryOrdering } from '@graphql/generated';
import { useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';

import { isValueInEnum } from '@/utils/is-value-in-enum';

export const useSolutionCategoryListLocalstorage = () => {
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>(
      'orderModeSolutionCategoryList',
      OrderingMode.Asc
    );
  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<SolutionCategoryOrdering>(
      'orderBySolutionCategoryList',
      SolutionCategoryOrdering.Name
    );
  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    'countSolutionCategoryList',
    50
  );

  useEffect(() => {
    if (!isValueInEnum(orderBy, SolutionCategoryOrdering)) {
      setOrderBy(SolutionCategoryOrdering.Name);
    }
  }, [orderBy, setOrderBy]);

  const resetAll = () => {
    removeOrderBy();
    removeOrderMode();
    removePageSize();
  };

  const removeOrder = () => {
    removeOrderBy();
    removeOrderMode();
  };

  return {
    orderBy,
    setOrderBy,
    orderMode,
    setOrderMode,
    pageSize,
    setPageSize,
    resetAll,
    removeOrder,
  };
};
