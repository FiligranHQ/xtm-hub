'use client';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import PublicIntegrationFeedsList from '@/components/service/integration-feeds/[serviceInstanceId]/public-integration-feeds-list';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { useShareableResourceMapping } from '@/utils/shareable-resources/use-shareable-resource-mapping';
import { FilterKeyEnum } from '@generated/models/FilterKey.enum';
import { seoIntegrationFeedsQuery } from '@generated/seoIntegrationFeedsQuery.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { Skeleton } from 'filigran-ui';
import React, { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';
import { SeoIntegrationFeedListQuery } from './seo-integration-feed.graphql';

interface Props {
  serviceInstance: seoServiceInstanceFragment$data;
  baseUrl: string;
  isConnectorsFeatureEnabled: boolean;
}

export const IntegrationFeedListPageLoader: React.FC<Props> = ({
  serviceInstance,
  baseUrl,
  isConnectorsFeatureEnabled,
}) => {
  const [queryRef, loadQuery] = useQueryLoader<seoIntegrationFeedsQuery>(
    SeoIntegrationFeedListQuery
  );

  const { localStorageKey } = useShareableResourceMapping(
    serviceInstance.slug as ServiceSlug
  );

  const {
    pageSize,
    search,
    labels,
    integrationTypes,
    connectorTypes,
    deployable,
    setSearch,
  } = useServiceListLocalStorage(localStorageKey);

  useEffect(() => {
    loadQuery(
      {
        slug: serviceInstance.slug ?? '',
        count: pageSize,
        orderBy: 'created_at',
        orderMode: 'desc',
        serviceInstanceId: serviceInstance.id,
        searchTerm: search,
        filters: [
          { key: FilterKeyEnum.LABEL, value: labels },
          { key: FilterKeyEnum.INTEGRATION_TYPE, value: integrationTypes },
          { key: FilterKeyEnum.INTEGRATION_SUBTYPE, value: connectorTypes },
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
    connectorTypes,
    deployable,
  ]);

  return (
    <>
      {queryRef ? (
        <PublicIntegrationFeedsList
          serviceInstance={serviceInstance}
          search={search}
          onSearchChange={setSearch}
          queryRef={queryRef}
          baseUrl={baseUrl}
          isConnectorsFeatureEnabled={isConnectorsFeatureEnabled}
        />
      ) : (
        <Skeleton className="w-full inset-1/2" />
      )}
    </>
  );
};
