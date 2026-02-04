'use client';

import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import { DocumentsListQuery } from '@/components/service/document/document.graphql';
import IntegrationsList from '@/components/service/integrations/[serviceInstanceId]/integrations-list';
import { buildTypeSubtypeFilterExpression } from '@/components/service/integrations/integration.utils';
import { Skeleton } from '@filigran/ui';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { FilterKeyEnum } from '@generated/models/FilterKey.enum';
import { LogicalOperatorEnum } from '@generated/models/LogicalOperator.enum';
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
    setSearch,
    deployable,
    verified,
  } = useServiceListLocalStorage(
    ServiceListLocalStorageKey.OpenCTIIntegrationFeeds
  );

  useEffect(() => {
    const typeSubtypeFilter =
      buildTypeSubtypeFilterExpression(integrationTypes);

    loadQuery(
      {
        count: pageSize,
        orderBy: 'name',
        orderMode: 'asc',
        serviceInstanceId: serviceInstance.id,
        searchTerm: search,
        logicalFilters: {
          operator: LogicalOperatorEnum.AND,
          children: [
            {
              leaf: { key: FilterKeyEnum.LABEL, value: Object.keys(labels) },
            },
            ...(typeSubtypeFilter ? [typeSubtypeFilter] : []),
            {
              leaf: {
                key: FilterKeyEnum.PRODUCT_VERSION,
                value: Object.keys(productVersions),
              },
            },
            {
              leaf: {
                key: FilterKeyEnum.MANAGER_SUPPORTED,
                value: Object.keys(deployable),
              },
            },
            {
              leaf: {
                key: FilterKeyEnum.VERIFIED,
                value: Object.keys(verified),
              },
            },
          ],
        },
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
    productVersions,
    deployable,
    verified,
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
