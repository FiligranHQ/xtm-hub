'use client';

import {pageLoaderServiceQuery,} from '../../__generated__/pageLoaderServiceQuery.graphql';
import * as React from 'react';
import {graphql, useQueryLoader} from 'react-relay';
import ServiceList from '@/components/service/service-list';
import useMountingLoader from "@/hooks/useMountingLoader";
import {useSearchParams} from "next/navigation";

// Query Configuration
export const ServiceListQuery = graphql`
  query pageLoaderServiceQuery(
    $count: Int!
    $cursor: ID
    $orderBy: ServiceOrdering!
    $orderMode: OrderingMode!
  ) {
    ...serviceList_services
  }
`;

// Component interface
interface ServiceListPreloaderProps {
}

// Component
const PageLoader: React.FunctionComponent<ServiceListPreloaderProps> = () => {
  const searchParams = useSearchParams()
  const count = Number(searchParams.get('count') ?? 2)
  const orderMode = searchParams.get('orderMode') ?? "asc"
  const orderBy = searchParams.get('orderBy') ?? "name"
  const [queryRef, loadQuery] = useQueryLoader<pageLoaderServiceQuery>(ServiceListQuery);
  useMountingLoader(loadQuery, {count, orderBy, orderMode});
  return (
    <>
      <h2>ServiceComponent</h2>
      { queryRef ? <ServiceList queryRef={queryRef} /> : <div>SPINNER</div> }
    </>
  );
};

// Component export
export default PageLoader;
