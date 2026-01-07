'use client';

import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import CustomDashboardsList from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboards-list';
import { CustomDashboardsListQuery } from '@/components/service/custom-dashboards/custom-dashboard.graphql';
import { Skeleton } from '@filigran/ui';
import { customDashboardsQuery } from '@generated/customDashboardsQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

interface PageLoaderProps {
  serviceInstance: serviceInstance_fragment$data;
}

const PageLoader = ({ serviceInstance }: PageLoaderProps) => {
  const [queryRef, loadQuery] = useQueryLoader<customDashboardsQuery>(
    CustomDashboardsListQuery
  );
  const { count, search, setSearch, labels } = useServiceListLocalStorage(
    ServiceListLocalStorageKey.OpenCTICustomDashboards
  );

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
        />
      ) : (
        <Skeleton className="w-full inset-1/2" />
      )}
    </>
  );
};

// Component export
export default PageLoader;
