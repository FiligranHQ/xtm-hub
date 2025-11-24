import { ServiceListHeader } from '@/components/service/components/header/service-list-header';
import { AppServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { PaginationControls } from '@/components/ui/pagination/pagination-controls';
import { PublicShareableResourceList } from '@/components/ui/shareable-resource/public-shareable-resource-list';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { useShareableResourceMapping } from '@/utils/shareable-resources/use-shareable-resource-mapping';
import { integrationFeedsQuery$variables } from '@generated/integrationFeedsQuery.graphql';
import { seoIntegrationFeedsItemFragment$key } from '@generated/seoIntegrationFeedsItemFragment.graphql';
import { seoIntegrationFeedsList$key } from '@generated/seoIntegrationFeedsList.graphql';
import { seoIntegrationFeedsQuery } from '@generated/seoIntegrationFeedsQuery.graphql';
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
  SeoIntegrationFeedListQuery,
  seoIntegrationFeedsFragment,
  seoIntegrationFeedsItem,
} from '../../../../../app/(public)/cybersecurity-solutions/[slug]/seo-integration-feed.graphql';

interface Props {
  serviceInstance: seoServiceInstanceFragment$data;
  search: string;
  onSearchChange: (v: string) => void;
  queryRef: PreloadedQuery<seoIntegrationFeedsQuery>;
  baseUrl: string;
}

const PublicIntegrationFeedsList: React.FC<Props> = ({
  queryRef,
  serviceInstance,
  baseUrl,
}) => {
  const queryData = usePreloadedQuery<seoIntegrationFeedsQuery>(
    SeoIntegrationFeedListQuery,
    queryRef
  );

  const [data, refetch] = useRefetchableFragment<
    seoIntegrationFeedsQuery,
    seoIntegrationFeedsList$key
  >(seoIntegrationFeedsFragment, queryData);

  const integrationFeeds = useMemo(() => {
    return (data.publicIntegrationFeeds?.edges ?? [])
      .map(({ node }) =>
        readInlineData<seoIntegrationFeedsItemFragment$key>(
          seoIntegrationFeedsItem,
          node
        )
      )
      .filter((l) => !!l);
  }, [data.publicIntegrationFeeds?.edges]);

  const { filters, localStorageKey } = useShareableResourceMapping(
    serviceInstance.slug as ServiceSlug
  );

  const { search, setSearch, pageSize, setPageSize } =
    useServiceListLocalStorage(localStorageKey);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const handleRefetchData = (
    args?: Partial<integrationFeedsQuery$variables>
  ) => {
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
            totalCount={data.publicIntegrationFeeds.totalCount}
            pageSize={pageSize}
            pageIndex={pagination.pageIndex}
            onPaginationChange={onPaginationChange}
            onSetPageSize={setPageSize}
          />
        }
      />
      <PublicShareableResourceList
        documents={integrationFeeds}
        serviceInstance={serviceInstance}
        baseUrl={baseUrl}
      />
    </AppServiceListLocalStorageKeyContext>
  );
};

export default PublicIntegrationFeedsList;
