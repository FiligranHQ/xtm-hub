import { isValueInEnum } from '@/utils/is-value-in-enum';
import { OrderingMode, PulseNetworkPlatformOrdering } from '@graphql/generated';
import { useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export const useThreatPulsePlatformsLocalstorage = () => {
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>(
      'orderModeThreatPulsePlatforms',
      OrderingMode.Desc
    );
  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<PulseNetworkPlatformOrdering>(
      'orderByThreatPulsePlatforms',
      PulseNetworkPlatformOrdering.RecordsLast_30Days
    );
  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    'countThreatPulsePlatforms',
    50
  );

  useEffect(() => {
    if (!isValueInEnum(orderBy, PulseNetworkPlatformOrdering)) {
      setOrderBy(PulseNetworkPlatformOrdering.RecordsLast_30Days);
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
