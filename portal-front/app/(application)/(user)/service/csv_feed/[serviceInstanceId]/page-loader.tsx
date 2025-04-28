'use client';

import CsvFeedPage from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed-page';
import { CsvFeedsListQuery } from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed.graphql';
import { csvFeedListLocalStorage } from '@/components/service/csv_feed/csv_feed-list-localstorage';
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
        <CsvFeedPage
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
