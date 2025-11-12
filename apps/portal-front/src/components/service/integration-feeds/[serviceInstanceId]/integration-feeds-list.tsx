import {
  ServiceListFilterKey,
  ServiceListFilterMap,
} from '@/components/service/components/header/service-list-header';
import { AppServiceContext } from '@/components/service/components/service-context';
import ServiceList from '@/components/service/components/service-list';
import { AppServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/components/service/components/use-service-list-local-storage';
import { useCsvFeedContext } from '@/components/service/csv-feeds/use-csv-feed-context';
import {
  integrationFeedsFragment,
  integrationFeedsItem,
  IntegrationFeedsListQuery,
} from '@/components/service/integration-feeds/integration-feed.graphql';
import { PaginationControls } from '@/components/ui/pagination/pagination-controls';
import { IntegrationFeedFilters } from '@/components/ui/shareable-resource/integration-feed/integration-feed-filters';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import {
  integrationFeedsItem_fragment$data,
  integrationFeedsItem_fragment$key,
} from '@generated/integrationFeedsItem_fragment.graphql';
import { integrationFeedsList$key } from '@generated/integrationFeedsList.graphql';
import {
  integrationFeedsQuery,
  integrationFeedsQuery$variables,
} from '@generated/integrationFeedsQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PaginationState } from '@tanstack/react-table';
import { useState } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface IntegrationFeedsListProps {
  queryRef: PreloadedQuery<integrationFeedsQuery>;
  serviceInstance: serviceInstance_fragment$data;
  search: string;
  onSearchChange: (v: string) => void;
}

const IntegrationFeedsList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
}: IntegrationFeedsListProps) => {
  const queryData = usePreloadedQuery<integrationFeedsQuery>(
    IntegrationFeedsListQuery,
    queryRef
  );

  const [data, refetch] = useRefetchableFragment<
    integrationFeedsQuery,
    integrationFeedsList$key
  >(integrationFeedsFragment, queryData);

  const [active, draft] = useActiveAndDraftSplit<
    integrationFeedsItem_fragment$data,
    integrationFeedsItem_fragment$key
  >(data?.integrationFeeds.edges, integrationFeedsItem);

  const connectionId = data?.integrationFeeds.__id;

  const context = useCsvFeedContext(serviceInstance, connectionId);

  const localStorageKey = ServiceListLocalStorageKey.OpenCTIIntegrationFeeds;

  const {
    removeConnectorTypes,
    removeIntegrationTypes,
    pageSize,
    setPageSize,
  } = useServiceListLocalStorage(localStorageKey);

  const isConnectorsFeatureFlagEnabled = useIsFeatureEnabled(
    FeatureFlag.CONNECTORS_INTEGRATION_FEEDS
  );

  const filters: ServiceListFilterMap = isConnectorsFeatureFlagEnabled
    ? {
        [ServiceListFilterKey.IntegrationFeedType]: {
          node: <IntegrationFeedFilters />,
          reset: () => {
            removeConnectorTypes();
            removeIntegrationTypes();
          },
        },
      }
    : {};

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
    <AppServiceContext {...context}>
      <AppServiceListLocalStorageKeyContext localStorageKey={localStorageKey}>
        <ServiceList
          active={active}
          draft={draft}
          search={search}
          onSearchChange={onSearchChange}
          additionalFilters={filters}
          paginationControls={
            isConnectorsFeatureFlagEnabled && (
              <PaginationControls
                totalCount={data.integrationFeeds.totalCount}
                pageSize={pageSize}
                pageIndex={pagination.pageIndex}
                onPaginationChange={onPaginationChange}
                onSetPageSize={setPageSize}
              />
            )
          }
        />
      </AppServiceListLocalStorageKeyContext>
    </AppServiceContext>
  );
};

export default IntegrationFeedsList;
