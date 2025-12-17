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
  integrationsFragment,
  integrationsItem,
  IntegrationsListQuery,
} from '@/components/service/integration-feeds/integration.graphql';
import { PaginationControls } from '@/components/ui/pagination/pagination-controls';
import { IntegrationFeedDeployableFilter } from '@/components/ui/shareable-resource/integration-feed/integration-feed-deployable-filter';
import { IntegrationFeedFilters } from '@/components/ui/shareable-resource/integration-feed/integration-feed-filters';
import { ProductVersionFilter } from '@/components/ui/shareable-resource/product-version-filter';
import {
  integrationsItem_fragment$data,
  integrationsItem_fragment$key,
} from '@generated/integrationsItem_fragment.graphql';
import { integrationsList$key } from '@generated/integrationsList.graphql';

import {
  integrationsQuery,
  integrationsQuery$variables,
} from '@generated/integrationsQuery.graphql';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PaginationState } from '@tanstack/react-table';
import { useState } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface IntegrationFeedsListProps {
  queryRef: PreloadedQuery<integrationsQuery>;
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
  const queryData = usePreloadedQuery<integrationsQuery>(
    IntegrationsListQuery,
    queryRef
  );

  const [data, refetch] = useRefetchableFragment<
    integrationsQuery,
    integrationsList$key
  >(integrationsFragment, queryData);

  const [active, draft] = useActiveAndDraftSplit<
    integrationsItem_fragment$data,
    integrationsItem_fragment$key
  >(data?.integrations.edges, integrationsItem);

  const connectionId = data?.integrations.__id;

  const context = useCsvFeedContext(serviceInstance, connectionId);

  const localStorageKey = ServiceListLocalStorageKey.OpenCTIIntegrationFeeds;

  const {
    removeConnectorTypes,
    removeIntegrationTypes,
    removeProductVersions,
    removeDeployable,
    pageSize,
    setPageSize,
  } = useServiceListLocalStorage(localStorageKey);

  const filters: ServiceListFilterMap = {
    [ServiceListFilterKey.IntegrationsType]: {
      node: <IntegrationFeedFilters />,
      reset: () => {
        removeConnectorTypes();
        removeIntegrationTypes();
      },
    },
    [ServiceListFilterKey.ProductVersion]: {
      node: (
        <ProductVersionFilter
          platformIdentifier={PlatformIdentifierEnum.OPENCTI}
        />
      ),
      reset: removeProductVersions,
    },
    [ServiceListFilterKey.ManagerSupported]: {
      node: <IntegrationFeedDeployableFilter />,
      reset: removeDeployable,
    },
  };

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
    <AppServiceContext {...context}>
      <AppServiceListLocalStorageKeyContext localStorageKey={localStorageKey}>
        <ServiceList
          active={active}
          draft={draft}
          search={search}
          onSearchChange={onSearchChange}
          additionalFilters={filters}
          paginationControls={
            <PaginationControls
              totalCount={data.integrations.totalCount}
              pageSize={pageSize}
              pageIndex={pagination.pageIndex}
              onPaginationChange={onPaginationChange}
              onSetPageSize={setPageSize}
            />
          }
        />
      </AppServiceListLocalStorageKeyContext>
    </AppServiceContext>
  );
};

export default IntegrationFeedsList;
