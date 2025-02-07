'use client';

import CustomDashbordDocumentList from '@/components/service/custom-dashboards/[slug]/custom-dashboard-list';
import { customDashboardListLocalStorage } from '@/components/service/custom-dashboards/custom-dashboard-list-localstorage';
import { DocumentsListQuery } from '@/components/service/document/document.graphql';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Skeleton } from 'filigran-ui';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

interface PageLoaderProps {
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

const PageLoader = ({ serviceInstance }: PageLoaderProps) => {
  const [queryRef, loadQuery] =
    useQueryLoader<documentsQuery>(DocumentsListQuery);
  const { count } = customDashboardListLocalStorage();

  useEffect(() => {
    loadQuery(
      {
        count,
        orderBy: 'created_at',
        orderMode: 'desc',
        serviceInstanceId: serviceInstance.id,
        parentsOnly: true,
      },
      {
        fetchPolicy: 'store-and-network',
      }
    );
  }, [loadQuery, count, serviceInstance]);

  return (
    <>
      {queryRef ? (
        <CustomDashbordDocumentList
          serviceInstance={serviceInstance}
          queryRef={queryRef}
        />
      ) : (
        <Skeleton className="w-full inset-1/2" />
      )}
    </>
  );

  return;
};

// Component export
export default PageLoader;
