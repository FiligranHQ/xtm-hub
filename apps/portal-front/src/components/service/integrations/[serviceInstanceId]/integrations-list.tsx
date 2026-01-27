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
import {
  integrationsFragment,
  integrationsItem,
  IntegrationsListQuery,
} from '@/components/service/integrations/integration.graphql';
import { PaginationControls } from '@/components/ui/pagination/pagination-controls';
import { IntegrationDeployableFilter } from '@/components/ui/shareable-resource/integration/integration-deployable-filter';
import { IntegrationFilters } from '@/components/ui/shareable-resource/integration/integration-filters';
import { ProductVersionFilter } from '@/components/ui/shareable-resource/product-version-filter';
import {
  integrationsItem_fragment$data,
  integrationsItem_fragment$key,
} from '@generated/integrationsItem_fragment.graphql';
import { integrationsList$key } from '@generated/integrationsList.graphql';

import { useDocumentContext } from '@/components/service/document/use-document-context';
import { IntegrationVerifiedFilter } from '@/components/ui/shareable-resource/integration/integration-verified-filter';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
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

interface IntegrationsListProps {
  queryRef: PreloadedQuery<integrationsQuery>;
  serviceInstance: serviceInstance_fragment$data;
  search: string;
  onSearchChange: (v: string) => void;
}

const IntegrationsList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
}: IntegrationsListProps) => {
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

  const context = useDocumentContext({
    serviceInstance,
    connectionId,
    type: ShareableResourceType.OPENCTI_INTEGRATION,
  });

  const localStorageKey = ServiceListLocalStorageKey.OpenCTIIntegrationFeeds;

  const {
    removeIntegrationTypes,
    removeProductVersions,
    removeDeployable,
    removeVerified,
    pageSize,
    setPageSize,
  } = useServiceListLocalStorage(localStorageKey);

  const filters: ServiceListFilterMap = {
    [ServiceListFilterKey.IntegrationType]: {
      node: <IntegrationFilters />,
      reset: () => {
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
      node: <IntegrationDeployableFilter />,
      reset: removeDeployable,
    },
    [ServiceListFilterKey.Verified]: {
      node: <IntegrationVerifiedFilter />,
      reset: removeVerified,
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
          connectionId={connectionId}
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

export default IntegrationsList;
