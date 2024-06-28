'use client';

import * as React from 'react';
import {graphql, useQueryLoader} from 'react-relay';
import ServiceList from '@/components/service/service-list';
import useMountingLoader from '@/hooks/useMountingLoader';
import {useSearchParams} from 'next/navigation';
import {pageLoaderServiceQuery} from '../../../../__generated__/pageLoaderServiceQuery.graphql';
import Loader from '@/components/loader';

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

// Configuration or Preloader Query

// Component
const PageLoader: React.FunctionComponent<ServiceListPreloaderProps> = () => {
    const searchParams = useSearchParams();
    const count = Number(searchParams.get('count') ?? 10);
    const orderMode = searchParams.get('orderMode') ?? 'asc';
    const orderBy = searchParams.get('orderBy') ?? 'name';
    const [queryRef, loadQuery] =
        useQueryLoader<pageLoaderServiceQuery>(ServiceListQuery);
    useMountingLoader(loadQuery, {count, orderBy, orderMode});
    return <>{queryRef ? <ServiceList queryRef={queryRef}/> : <Loader/>}</>;
};

// Component export
export default PageLoader;
