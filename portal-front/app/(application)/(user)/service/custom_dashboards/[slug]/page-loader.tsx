'use client';

import CustomDashbordDocumentList from '@/components/service/custom-dashboards/[slug]/document-list';
import { customDashboardListLocalStorage } from '@/components/service/custom-dashboards/custom-dashboard-list-localstorage';
import { DocumentsListQuery } from '@/components/service/document/document.graphql';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

interface PageLoaderProps {
  service: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

const PageLoader = ({ service }: PageLoaderProps) => {
  const [queryRef, loadQuery] =
    useQueryLoader<documentsQuery>(DocumentsListQuery);
  const { count } = customDashboardListLocalStorage();

  useEffect(() => {
    loadQuery(
      {
        count,
        orderBy: 'created_at',
        orderMode: 'desc',
        serviceInstanceId: service.id,
      },
      {
        fetchPolicy: 'store-and-network',
      }
    );
  }, [loadQuery, count, service]);

  return (
    <>
      {queryRef && (
        <CustomDashbordDocumentList
          service={service}
          queryRef={queryRef}
        />
      )}
    </>
  );

  return;
};

// Component export
export default PageLoader;
