'use client';

import Loader from '@/components/loader';
import useMountingLoader from '@/hooks/useMountingLoader';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';

import { publicServiceListQuery } from '@/components/service/public-service.graphql';
import ServiceList from '@/components/service/service-list';
import { UserServiceOwnedQuery } from '@/components/service/user_service.graphql';
import { useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';

import {
  OrderingMode,
  publicServiceQuery,
  ServiceOrdering,
} from '../../__generated__/publicServiceQuery.graphql';
import { userServiceOwnedQuery } from '../../__generated__/userServiceOwnedQuery.graphql';

export const dynamic = 'force-dynamic';

const Page: React.FunctionComponent = () => {
  // Owned services
  const [count] = useLocalStorage('countServiceOwned', 50);
  const [orderMode] = useLocalStorage('orderModeServiceOwned', 'asc');
  const [orderBy] = useLocalStorage('orderByServiceOwned', 'service_name');
  const [queryRefUserServiceOwned, loadQueryUserServiceOwned] =
    useQueryLoader<userServiceOwnedQuery>(UserServiceOwnedQuery);
  useMountingLoader(loadQueryUserServiceOwned, { count, orderBy, orderMode });

  const handleUpdate = useCallback(() => {
    loadQueryUserServiceOwned(
      {
        count,
        orderBy: 'service_name',
        orderMode: 'asc',
      },
      { fetchPolicy: 'network-only' }
    );
  }, []);

  // Public services
  const [countServiceList] = useLocalStorage('countServiceList', 50);
  const [orderModeServiceList] = useLocalStorage<OrderingMode>(
    'orderModeServiceList',
    'asc'
  );
  const [orderByServiceList] = useLocalStorage<ServiceOrdering>(
    'orderByServiceList',
    'name'
  );

  const [queryRefPublicServiceList, loadQueryPublicServiceList] =
    useQueryLoader<publicServiceQuery>(publicServiceListQuery);

  useMountingLoader(loadQueryPublicServiceList, {
    count: countServiceList,
    orderBy: orderByServiceList,
    orderMode: orderModeServiceList,
  });

  if (!queryRefUserServiceOwned || !queryRefPublicServiceList)
    return <Loader />;

  return (
    <ServiceList
      queryRefUserServiceOwned={queryRefUserServiceOwned}
      queryRefServiceList={queryRefPublicServiceList}
      onUpdate={handleUpdate}
    />
  );
};

// Component export
export default Page;
