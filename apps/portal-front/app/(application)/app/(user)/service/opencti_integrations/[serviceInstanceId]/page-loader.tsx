'use client';

import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import IntegrationsList from '@/components/service/integrations/[serviceInstanceId]/integrations-list';
import { IntegrationsListQuery } from '@/components/service/integrations/integration.graphql';
import { Skeleton } from '@filigran/ui';
import { integrationsQuery } from '@generated/integrationsQuery.graphql';
import { FilterKeyEnum } from '@generated/models/FilterKey.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

interface PageLoaderProps {
  serviceInstance: serviceInstance_fragment$data;
}

const PageLoader = ({ serviceInstance }: PageLoaderProps) => {
  const [queryRef, loadQuery] = useQueryLoader<integrationsQuery>(
    IntegrationsListQuery
  );
  const {
    pageSize,
    search,
    labels,
    integrationTypes,
    integrationSubTypes,
    productVersions,
    setSearch,
    deployable,
  } = useServiceListLocalStorage(
    ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
  );

  useEffect(() => {
    loadQuery(
      {
        count: pageSize,
        orderBy: 'name',
        orderMode: 'asc',
        serviceInstanceId: serviceInstance.id,
        searchTerm: search,
        filters: [
          { key: FilterKeyEnum.LABEL, value: labels },
          { key: FilterKeyEnum.INTEGRATION_TYPE, value: integrationTypes },
          {
            key: FilterKeyEnum.INTEGRATION_SUBTYPE,
            value: integrationSubTypes,
          },
          { key: FilterKeyEnum.PRODUCT_VERSION, value: productVersions },
          { key: FilterKeyEnum.MANAGER_SUPPORTED, value: deployable },
        ],
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
    labels,
    integrationTypes,
    integrationSubTypes,
    productVersions,
    deployable,
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
