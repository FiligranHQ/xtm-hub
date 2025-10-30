'use client';

import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import IntegrationFeedsList from '@/components/service/integration-feeds/[serviceInstanceId]/integration-feeds-list';
import { IntegrationFeedsListQuery } from '@/components/service/integration-feeds/integration-feed.graphql';
import { integrationFeedsQuery } from '@generated/integrationFeedsQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { Skeleton } from 'filigran-ui';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

interface PageLoaderProps {
  serviceInstance: serviceInstance_fragment$data;
}

const PageLoader = ({ serviceInstance }: PageLoaderProps) => {
  const [queryRef, loadQuery] = useQueryLoader<integrationFeedsQuery>(
    IntegrationFeedsListQuery
  );
  const { count, search, labels, integrationTypes, connectorTypes, setSearch } =
    useServiceListLocalStorage(
      ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
    );

  useEffect(() => {
    loadQuery(
      {
        count,
        orderBy: 'created_at',
        orderMode: 'desc',
        serviceInstanceId: serviceInstance.id,
        searchTerm: search,
        filters: [
          { key: 'label', value: labels },
          { key: 'integration_type', value: integrationTypes },
          { key: 'integration_subtype', value: connectorTypes },
        ],
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
    labels,
    integrationTypes,
    connectorTypes,
  ]);

  return (
    <>
      {queryRef ? (
        <IntegrationFeedsList
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
