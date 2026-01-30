import { ServiceListHeader } from '@/components/service/components/header/service-list-header';
import { AppServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { PaginationControls } from '@/components/ui/pagination/pagination-controls';
import { PublicShareableResourceList } from '@/components/ui/shareable-resource/public-shareable-resource-list';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { useShareableResourceMapping } from '@/utils/shareable-resources/use-shareable-resource-mapping';
import { integrationsQuery$variables } from '@generated/integrationsQuery.graphql';
import { seoIntegrationsItemFragment$key } from '@generated/seoIntegrationsItemFragment.graphql';
import { seoIntegrationsList$key } from '@generated/seoIntegrationsList.graphql';
import { seoIntegrationsQuery } from '@generated/seoIntegrationsQuery.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { PaginationState } from '@tanstack/react-table';
import React, { useMemo, useState } from 'react';
import {
  PreloadedQuery,
  readInlineData,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
  SeoIntegrationListQuery,
  seoIntegrationsFragment,
  seoIntegrationsItem,
} from '../../../../../app/(public)/cybersecurity-solutions/[slug]/seo-integration.graphql';

interface Props {
  serviceInstance: seoServiceInstanceFragment$data;
  search: string;
  onSearchChange: (v: string) => void;
  queryRef: PreloadedQuery<seoIntegrationsQuery>;
  baseUrl: string;
}

const PublicIntegrationsList: React.FC<Props> = ({
  queryRef,
  serviceInstance,
  baseUrl,
}) => {
  const queryData = usePreloadedQuery<seoIntegrationsQuery>(
    SeoIntegrationListQuery,
    queryRef
  );

  const [data, refetch] = useRefetchableFragment<
    seoIntegrationsQuery,
    seoIntegrationsList$key
  >(seoIntegrationsFragment, queryData);

  const integrations = useMemo(() => {
    return (data.publicIntegrations?.edges ?? [])
      .map(({ node }) =>
        readInlineData<seoIntegrationsItemFragment$key>(
          seoIntegrationsItem,
          node
        )
      )
      .filter((l) => !!l);
  }, [data.publicIntegrations]);

  const { filters, localStorageKey } = useShareableResourceMapping(
    serviceInstance.slug as ServiceSlug
  );

  const { search, setSearch, pageSize, setPageSize } =
    useServiceListLocalStorage(localStorageKey);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const handleRefetchData = (args?: Partial<integrationsQuery$variables>) => {
    refetch({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      ...args,
    });
  };

  const onPaginationChange = (newPaginationValue: PaginationState) => {
    handleRefetchData({
      count: newPaginationValue.pageSize,
      cursor: btoa(
        String(newPaginationValue.pageSize * newPaginationValue.pageIndex)
      ),
    });

    setPagination(newPaginationValue);
    if (newPaginationValue.pageSize !== pageSize) {
      setPageSize(newPaginationValue.pageSize);
    }
  };

  return (
    <AppServiceListLocalStorageKeyContext localStorageKey={localStorageKey}>
      <ServiceListHeader
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        className="mb-3"
        paginationControls={
          <PaginationControls
            totalCount={data.publicIntegrations.totalCount}
            pageSize={pageSize}
            pageIndex={pagination.pageIndex}
            onPaginationChange={onPaginationChange}
            onSetPageSize={setPageSize}
          />
        }
      />
      <PublicShareableResourceList
        documents={integrations}
        serviceInstance={serviceInstance}
        baseUrl={baseUrl}
      />
    </AppServiceListLocalStorageKeyContext>
  );
};

export default PublicIntegrationsList;
