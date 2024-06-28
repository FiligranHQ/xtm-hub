'use client';
import * as React from 'react';
import ServiceList from '@/components/service/service-list';
import { useQueryLoader } from 'react-relay';
import { pageLoaderServiceQuery } from '../../__generated__/pageLoaderServiceQuery.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import { ServiceListQuery } from './(user)/service/page-loader';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Component interface
interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  const searchParams = useSearchParams();
  const count = Number(searchParams.get('count') ?? 10);
  const orderMode = searchParams.get('orderMode') ?? 'asc';
  const orderBy = searchParams.get('orderBy') ?? 'name';
  const [queryRef, loadQuery] =
    useQueryLoader<pageLoaderServiceQuery>(ServiceListQuery);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return (
    <>
      <div>
        <b>Welcome to the platform</b>
        {queryRef ? (
          <ServiceList
            shouldDisplayOnlyOwnedService={true}
            queryRef={queryRef}
          />
        ) : (
          <Loader />
        )}
      </div>
    </>
  );
};

// Component export
export default Page;
