'use client';

import { DocumentsListQuery } from '@/components/service/document/document.graphql';
import IntegrationsList from '@/components/service/integrations/[serviceInstanceId]/IntegrationsList';
import { useIntegrationListStorage } from '@/components/service/integrations/[serviceInstanceId]/use-integration-list-storage';
import { useIntegrationListUrlFilters } from '@/components/service/integrations/[serviceInstanceId]/use-integration-list-url-filters';
import { useLogicalFiltersFromStorage } from '@/hooks/use-logical-filters-from-storage';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { Skeleton } from '@filigran/ui';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

interface PageLoaderProps {
  serviceInstance: serviceInstance_fragment$data;
}

const PageLoader = ({ serviceInstance }: PageLoaderProps) => {
  const [queryRef, loadQuery] =
    useQueryLoader<documentsQuery>(DocumentsListQuery);
  const {
    pageSize,
    search,
    labels,
    integrationTypes,
    productVersions,
    licenseTypes,
    solutionCategories,
    setSearch,
    deployable,
    verified,
    orderBy,
    orderMode,
    resetAll,
    filters,
    setFilters,
    setSelectedFilters,
  } = useIntegrationListStorage();

  useIntegrationListUrlFilters({
    filters,
    resetAll,
    setFilters,
    setSelectedFilters,
  });

  const logicalFilters = useLogicalFiltersFromStorage(
    {
      serviceInstanceSlug: ServiceSlug.OPEN_CTI_INTEGRATIONS,
      labels,
      deployable,
      verified,
      integrationTypes,
      productVersions,
      licenseTypes,
      solutionCategories,
    },
    true
  );

  useEffect(() => {
    loadQuery(
      {
        count: pageSize,
        orderBy,
        orderMode,
        serviceInstanceId: serviceInstance.id,
        searchTerm: search,
        logicalFilters,
      },
      {
        fetchPolicy: 'store-and-network',
      }
    );
  }, [
    loadQuery,
    pageSize,
    serviceInstance,
    search,
    logicalFilters,
    orderBy,
    orderMode,
  ]);

  return (
    <>
      {queryRef ? (
        <IntegrationsList
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
