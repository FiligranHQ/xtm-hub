'use client';

import Loader from '@/components/loader';
import { publicServiceListQuery } from '@/components/service/public-service.graphql';
import ServiceList from '@/components/service/service-list';
import { UserServiceOwnedQuery } from '@/components/service/user_service.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useQueryLoader } from 'react-relay';
import { useLocalStorage } from 'usehooks-ts';

import {
  OrderingMode,
  publicServiceQuery,
  ServiceInstanceOrdering,
} from '@generated/publicServiceQuery.graphql';
import RegisterRegisteredPlatformsQueryGraphql, {
  registerRegisteredPlatformsQuery,
} from '@generated/registerRegisteredPlatformsQuery.graphql';
import { userServiceOwnedQuery } from '@generated/userServiceOwnedQuery.graphql';

export const dynamic = 'force-dynamic';

const Page: React.FunctionComponent = () => {
  // Owned services
  const [count] = useLocalStorage('countServiceOwned', 50);
  const [orderMode] = useLocalStorage('orderModeServiceOwned', 'asc');
  const [orderBy] = useLocalStorage('orderByServiceOwned', 'ordering');
  const [queryRefUserServiceOwned, loadQueryUserServiceOwned] =
    useQueryLoader<userServiceOwnedQuery>(UserServiceOwnedQuery);
  useMountingLoader(loadQueryUserServiceOwned, { count, orderBy, orderMode });

  // Public services
  const [countServiceList] = useLocalStorage('countServiceList', 50);
  const [orderModeServiceList] = useLocalStorage<OrderingMode>(
    'orderModeServiceList',
    'asc'
  );
  const [orderByServiceList] = useLocalStorage<ServiceInstanceOrdering>(
    'orderByServiceList',
    'ordering'
  );

  const [queryRefPublicServiceList, loadQueryPublicServiceList] =
    useQueryLoader<publicServiceQuery>(publicServiceListQuery);

  useMountingLoader(loadQueryPublicServiceList, {
    count: countServiceList,
    orderBy: orderByServiceList,
    orderMode: orderModeServiceList,
  });

  // Registered Platforms
  const [queryRefRegisteredPlatforms, loadQueryRegisteredPlatforms] =
    useQueryLoader<registerRegisteredPlatformsQuery>(
      RegisterRegisteredPlatformsQueryGraphql
    );
  useMountingLoader(loadQueryRegisteredPlatforms, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const handleRefresh = () => {
      loadQueryRegisteredPlatforms({}, { fetchPolicy: 'network-only' });
    };

    window.addEventListener('refresh-registered-platforms', handleRefresh);

    return () => {
      window.removeEventListener('refresh-registered-platforms', handleRefresh);
    };
  }, [loadQueryRegisteredPlatforms]);

  const handleUpdate = useCallback(() => {
    loadQueryUserServiceOwned(
      {
        count,
        orderBy: 'service_name',
        orderMode: 'asc',
      },
      { fetchPolicy: 'network-only' }
    );
    loadQueryPublicServiceList(
      {
        count,
        orderBy: 'name',
        orderMode: 'asc',
      },
      { fetchPolicy: 'network-only' }
    );
    loadQueryRegisteredPlatforms({}, { fetchPolicy: 'network-only' });
  }, [
    count,
    loadQueryPublicServiceList,
    loadQueryRegisteredPlatforms,
    loadQueryUserServiceOwned,
  ]);

  if (
    !queryRefUserServiceOwned ||
    !queryRefPublicServiceList ||
    !queryRefRegisteredPlatforms
  )
    return <Loader />;

  return (
    <ServiceList
      queryRefUserServiceOwned={queryRefUserServiceOwned}
      queryRefServiceList={queryRefPublicServiceList}
      queryRefRegisteredPlatforms={queryRefRegisteredPlatforms}
      onUpdate={handleUpdate}
    />
  );
};

// Component export
export default Page;
