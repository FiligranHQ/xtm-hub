'use client';

import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import {DocumentsListQuery} from '@/components/service/document/document.graphql';
import {useLogicalFiltersFromStorage} from '@/components/service/document/use-logical-filters-from-storage';
import IntegrationsList from '@/components/service/integrations/[serviceInstanceId]/integrations-list';
import {ServiceSlug} from '@/utils/shareable-resources/shareable-resources.types';
import {Skeleton} from '@filigran/ui';
import {documentsQuery} from '@generated/documentsQuery.graphql';
import {serviceInstance_fragment$data} from '@generated/serviceInstance_fragment.graphql';
import {useEffect} from 'react';
import {useQueryLoader} from 'react-relay';

interface PageLoaderProps {
  serviceInstance: serviceInstance_fragment$data;
}

const PageLoader = ({serviceInstance}: PageLoaderProps) => {
  const [queryRef, loadQuery] =
    useQueryLoader<documentsQuery>(DocumentsListQuery);
  const {
    pageSize,
    search,
    labels,
    integrationTypes,
    productVersions,
    setSearch,
    deployable,
    verified,
    orderBy,
    orderMode,
  } = useServiceListLocalStorage(
    ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
  );

  const logicalFilters = useLogicalFiltersFromStorage({
    serviceInstanceSlug: ServiceSlug.OPEN_CTI_INTEGRATIONS,
    labels,
    deployable,
    verified,
    integrationTypes,
    productVersions,
  });

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
        <Skeleton className="w-full inset-1/2"/>
      )}
    </>
  );
};

// Component export
export default PageLoader;
