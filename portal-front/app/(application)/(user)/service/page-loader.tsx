'use client';

import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import ServiceList from '@/components/service/service-list';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import { ServiceListQuery } from '@/components/service/service.graphql';
import {
  OrderingMode,
  ServiceOrdering,
  serviceQuery,
} from '../../../../__generated__/serviceQuery.graphql';
import { useLocalStorage } from 'usehooks-ts';

// Component interface
interface ServiceListPreloaderProps {}

// Component
const PageLoader: React.FunctionComponent<ServiceListPreloaderProps> = () => {
  const [count, setCount] = useLocalStorage('countServiceList', 50);
  const [orderMode, setOrderMode] = useLocalStorage<OrderingMode>(
    'orderModeServiceList',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage<ServiceOrdering>(
    'orderByServiceList',
    'name'
  );

  const [queryRef, loadQuery] = useQueryLoader<serviceQuery>(ServiceListQuery);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return <>{queryRef ? <ServiceList queryRef={queryRef} /> : <Loader />}</>;
};

// Component export
export default PageLoader;
