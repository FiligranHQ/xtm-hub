'use client';

import { customDashboardListLocalStorage } from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-list-localstorage';
import CustomDashboardsList from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboards-list';
import { CustomDashboardsListQuery } from '@/components/service/custom-dashboards/custom-dashboards.graphql';
import { customDashboardsQuery } from '@generated/customDashboardsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Skeleton } from 'filigran-ui';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

interface PageLoaderProps {
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

const PageLoader = ({ serviceInstance }: PageLoaderProps) => {
  const [queryRef, loadQuery] = useQueryLoader<customDashboardsQuery>(
    CustomDashboardsListQuery
  );
  const { count, search, setSearch, labels, setLabels } =
    customDashboardListLocalStorage();

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
        <CustomDashboardsList
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
