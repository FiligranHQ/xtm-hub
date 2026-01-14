'use client';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import PublicIntegrationsList from '@/components/service/integrations/[serviceInstanceId]/public-integrations-list';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { useShareableResourceMapping } from '@/utils/shareable-resources/use-shareable-resource-mapping';
import { Skeleton } from '@filigran/ui';
import { FilterKeyEnum } from '@generated/models/FilterKey.enum';
import { seoIntegrationsQuery } from '@generated/seoIntegrationsQuery.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import React, { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';
import { SeoIntegrationListQuery } from './seo-integration.graphql';

interface Props {
  serviceInstance: seoServiceInstanceFragment$data;
  baseUrl: string;
}

export const IntegrationListPageLoader: React.FC<Props> = ({
  serviceInstance,
  baseUrl,
}) => {
  const [queryRef, loadQuery] = useQueryLoader<seoIntegrationsQuery>(
    SeoIntegrationListQuery
  );

  const { localStorageKey } = useShareableResourceMapping(
    serviceInstance.slug as ServiceSlug
  );

  const {
    pageSize,
    search,
    labels,
    integrationTypes,
    integrationSubTypes,
    deployable,
    setSearch,
  } = useServiceListLocalStorage(localStorageKey);

  useEffect(() => {
    loadQuery(
      {
        slug: serviceInstance.slug ?? '',
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
    deployable,
  ]);

  return (
    <>
      {queryRef ? (
        <PublicIntegrationsList
          serviceInstance={serviceInstance}
          search={search}
          onSearchChange={setSearch}
          queryRef={queryRef}
          baseUrl={baseUrl}
        />
      ) : (
        <Skeleton className="w-full inset-1/2" />
      )}
    </>
  );
};
