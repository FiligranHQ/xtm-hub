import { OrderingMode } from '@/components/ui/handle-sorting.utils';
import { CompetitorOrderingEnum } from '@generated/models/CompetitorOrdering.enum';
import { useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { isValueInEnum } from '@/utils/is-value-in-enum';

export const useCompetitorListLocalstorage = () => {
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>('orderModeCompetitorList', 'asc');
  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<CompetitorOrderingEnum>(
      'orderByCompetitorList',
      CompetitorOrderingEnum.TIER
    );

  useEffect(() => {
    if (!isValueInEnum(orderBy, CompetitorOrderingEnum)) {
      setOrderBy(CompetitorOrderingEnum.TIER);
    }
  }, [orderBy, setOrderBy]);

  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    'countCompetitorList',
    50
  );

  const resetAll = () => {
    removeOrderMode();
    removeOrderBy();
    removePageSize();
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
    pageSize,
    setPageSize,
    resetAll,
    removeOrder,
  };
};
