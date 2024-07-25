'use client';

import * as React from 'react';
import {useQueryLoader} from 'react-relay';
import ServiceList from '@/components/service/service-list';
import useMountingLoader from '@/hooks/useMountingLoader';
import {useSearchParams} from 'next/navigation';
import Loader from '@/components/loader';
import {ServiceListQuery} from '@/components/service/service.graphql';
import {serviceQuery} from '../../../../__generated__/serviceQuery.graphql';

// Component interface
interface ServiceListPreloaderProps {}

// Component
const PageLoader: React.FunctionComponent<ServiceListPreloaderProps> = () => {
  const searchParams = useSearchParams();
  const count = Number(searchParams.get('count') ?? 50);
  const orderMode = searchParams.get('orderMode') ?? 'asc';
  const orderBy = searchParams.get('orderBy') ?? 'name';
  const [queryRef, loadQuery] = useQueryLoader<serviceQuery>(ServiceListQuery);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return <>{queryRef ? <ServiceList queryRef={queryRef} /> : <Loader />}</>;
};

// Component export
export default PageLoader;
