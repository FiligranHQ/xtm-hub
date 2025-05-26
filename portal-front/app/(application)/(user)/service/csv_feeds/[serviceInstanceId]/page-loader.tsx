'use client';

import CsvFeedsList from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feeds-list';
import { csvFeedListLocalStorage } from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feeds-list-localstorage';
import { CsvFeedsListQuery } from '@/components/service/csv-feeds/csv-feed.graphql';
import { csvFeedsQuery } from '@generated/csvFeedsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Skeleton } from 'filigran-ui';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

interface PageLoaderProps {
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

const PageLoader = ({ serviceInstance }: PageLoaderProps) => {
  const [queryRef, loadQuery] =
    useQueryLoader<csvFeedsQuery>(CsvFeedsListQuery);
  const { count, search, labels, setSearch, setLabels } =
    csvFeedListLocalStorage();

  useEffect(() => {
    loadQuery(
      {
        count,
        orderBy: 'created_at',
        orderMode: 'desc',
        serviceInstanceId: serviceInstance.id,
        searchTerm: search,
        filters: [{ key: 'label', value: labels }],
      },
      {
        fetchPolicy: 'store-and-network',
      }
    );
  }, [loadQuery, count, serviceInstance, search, labels]);

  return (
    <>
      {queryRef ? (
        <CsvFeedsList
          serviceInstance={serviceInstance}
          queryRef={queryRef}
          search={search}
          onSearchChange={setSearch}
          onLabelFilterChange={setLabels}
          labels={labels}
        />
      ) : (
        <Skeleton className="w-full inset-1/2" />
      )}
    </>
  );
};

// Component export
export default PageLoader;
