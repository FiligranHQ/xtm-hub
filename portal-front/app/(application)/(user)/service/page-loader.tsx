'use client';

import * as React from 'react';
import {useQueryLoader} from 'react-relay';
import ServiceList from '@/components/service/service-list';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import {ServiceListQuery} from '@/components/service/service.graphql';
import {serviceQuery} from '../../../../__generated__/serviceQuery.graphql';

// Component interface
interface ServiceListPreloaderProps {}

// Component
const PageLoader: React.FunctionComponent<ServiceListPreloaderProps> = () => {
  let count = Number(localStorage.getItem('countServiceList'));
  if (!count) {
    localStorage.setItem('countServiceList', '50');
    count = 50;
  }
  let orderMode = localStorage.getItem('orderModeServiceList');
  if (!orderMode) {
    localStorage.setItem('orderModeServiceList', 'asc');
    orderMode = 'asc';
  }

  let orderBy = localStorage.getItem('orderByServiceList');
  if (!orderBy) {
    localStorage.setItem('orderByServiceList', 'name');
    orderBy = 'name';
  }
  const [queryRef, loadQuery] = useQueryLoader<serviceQuery>(ServiceListQuery);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return <>{queryRef ? <ServiceList queryRef={queryRef} /> : <Loader />}</>;
};

// Component export
export default PageLoader;
