'use client';
import { PublicDocumentListQuery } from '@/components/service/document/public-document.graphql';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { useShareableResourceMapping } from '@/utils/shareable-resources/use-shareable-resource-mapping';
import { Skeleton } from '@filigran/ui';
import { publicDocumentsQuery } from '@generated/publicDocumentsQuery.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import React, { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';
import PublicDocumentsList from '@/components/service/document/PublicDocumentsList';
import {
  LogicalFiltersParams,
  useLogicalFiltersFromStorage,
} from '@/hooks/use-logical-filters-from-storage';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';

interface Props {
  serviceInstance: seoServiceInstanceFragment$data;
  baseUrl: string;
}

export const PublicDocumentListPageLoader: React.FC<Props> = ({
  serviceInstance,
  baseUrl,
}) => {
  const [queryRef, loadQuery] = useQueryLoader<publicDocumentsQuery>(
    PublicDocumentListQuery
  );

  const serviceInstanceSlug = serviceInstance.slug as ServiceSlug;
  const { localStorageKey } = useShareableResourceMapping(serviceInstanceSlug);

  const {
    pageSize,
    search,
    labels,
    integrationTypes,
    deployable,
    verified,
    productVersions,
    orderMode,
    orderBy,
  } = useServiceListLocalStorage(localStorageKey);
  const params: LogicalFiltersParams =
    serviceInstanceSlug === ServiceSlug.OPEN_CTI_INTEGRATIONS
      ? {
          serviceInstanceSlug:
            serviceInstanceSlug as ServiceSlug.OPEN_CTI_INTEGRATIONS,
          labels,
          deployable,
          verified,
          integrationTypes,
          productVersions,
        }
      : {
          serviceInstanceSlug: serviceInstanceSlug as
            | ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS
            | ServiceSlug.OPEN_AEV_SCENARIOS,
          labels,
        };

  const logicalFilters = useLogicalFiltersFromStorage(params);

  useEffect(() => {
    loadQuery(
      {
        slug: serviceInstance.slug ?? '',
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
    labels,
    integrationTypes,
    deployable,
    verified,
    logicalFilters,
    orderMode,
    orderBy,
  ]);

  return (
    <>
      {queryRef ? (
        <PublicDocumentsList
          serviceInstance={serviceInstance}
          queryRef={queryRef}
          baseUrl={baseUrl}
        />
      ) : (
        <Skeleton className="w-full inset-1/2" />
      )}
    </>
  );
};
