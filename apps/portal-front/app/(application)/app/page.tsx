'use client';

import { EnrollOCTIInstancesQuery } from '@/components/enroll/enroll.graphql';
import Loader from '@/components/loader';
import { publicServiceListQuery } from '@/components/service/public-service.graphql';
import ServiceList from '@/components/service/service-list';
import { UserServiceOwnedQuery } from '@/components/service/user_service.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import * as React from 'react';
import { useCallback } from 'react';
import { useQueryLoader } from 'react-relay';
import { useLocalStorage } from 'usehooks-ts';

import { enrollOCTIInstancesQuery } from '@generated/enrollOCTIInstancesQuery.graphql';
import {
  OrderingMode,
  publicServiceQuery,
  ServiceInstanceOrdering,
} from '@generated/publicServiceQuery.graphql';
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

  // OCTI Instances
  const [queryRefOCTIInstances, loadQueryOCTIInstances] =
    useQueryLoader<enrollOCTIInstancesQuery>(EnrollOCTIInstancesQuery);
  useMountingLoader(loadQueryOCTIInstances, {});

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
    loadQueryOCTIInstances({}, { fetchPolicy: 'network-only' });
  }, []);

  if (
    !queryRefUserServiceOwned ||
    !queryRefPublicServiceList ||
    !queryRefOCTIInstances
  )
    return <Loader />;

  return (
    <ServiceList
      queryRefUserServiceOwned={queryRefUserServiceOwned}
      queryRefServiceList={queryRefPublicServiceList}
      queryRefOCTIInstances={queryRefOCTIInstances}
      onUpdate={handleUpdate}
    />
  );
};

// Component export
export default Page;
