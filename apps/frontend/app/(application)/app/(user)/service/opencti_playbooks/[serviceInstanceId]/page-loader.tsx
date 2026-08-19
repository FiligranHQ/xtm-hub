'use client';

import { DocumentsListQuery } from '@/components/service/document/document.graphql';
import OpenctiPlaybooksList from '@/components/service/opencti-playbooks/[serviceInstanceId]/OpenctiPlaybooksList';
import { useLogicalFiltersFromStorage } from '@/hooks/use-logical-filters-from-storage';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
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
    useServiceListLocalStorage(ServiceListLocalStorageKey.OpenCTIPlaybooks);
  const logicalFilters = useLogicalFiltersFromStorage({
    serviceInstanceSlug: ServiceSlug.OPEN_CTI_PLAYBOOKS,
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
        <OpenctiPlaybooksList
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

export default PageLoader;
