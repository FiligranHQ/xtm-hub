'use client';

import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import { DocumentsListQuery } from '@/components/service/document/document.graphql';
import { useLogicalFiltersFromStorage } from '@/components/service/document/use-logical-filters-from-storage';
import OpenaevScenariosList from '@/components/service/openaev-scenarios/[serviceInstanceId]/openaev-scenarios-list';
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
  const { count, search, labels, setSearch, orderMode, orderBy } =
    useServiceListLocalStorage(ServiceListLocalStorageKey.OpenAEVScenarios);
  const logicalFilters = useLogicalFiltersFromStorage({
    serviceInstanceSlug: ServiceSlug.OPEN_AEV_SCENARIOS,
    labels,
  });

  useEffect(() => {
    loadQuery(
      {
        count,
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
    count,
    serviceInstance,
    search,
    logicalFilters,
    orderBy,
    orderMode,
  ]);

  return (
    <>
      {queryRef ? (
        <OpenaevScenariosList
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
