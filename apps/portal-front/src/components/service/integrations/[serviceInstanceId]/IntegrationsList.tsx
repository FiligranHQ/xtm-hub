import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '../../../../hooks/use-service-list-local-storage';
import { PaginationControls } from '../../../ui/pagination/PaginationControls';
import { IntegrationDeployableFilter } from '../../../ui/shareable-resource/integration/IntegrationDeployableFilter';
import { IntegrationFilters } from '../../../ui/shareable-resource/integration/IntegrationFilters';
import { ProductVersionFilter } from '../../../ui/shareable-resource/ProductVersionFilter';
import {
  ServiceListFilterKey,
  ServiceListFilterMap,
} from '../../components/header/ServiceListHeader';
import { AppServiceContext } from '../../components/ServiceContext';
import ServiceList from '../../components/ServiceList';
import { AppServiceListLocalStorageKeyContext } from '../../components/ServiceListLocalStorageKeyContext';

import {
  documentItem,
  documentsFragment,
  DocumentsListQuery,
} from '@/components/service/document/document.graphql';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import {
  documentItem_fragment$data,
  documentItem_fragment$key,
} from '@generated/documentItem_fragment.graphql';
import { documentsList$key } from '@generated/documentsList.graphql';
import {
  documentsQuery,
  documentsQuery$variables,
} from '@generated/documentsQuery.graphql';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PaginationState } from '@tanstack/react-table';
import { useState } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import { IntegrationVerifiedFilter } from '../../../ui/shareable-resource/integration/IntegrationVerifiedFilter';

interface IntegrationsListProps {
  queryRef: PreloadedQuery<documentsQuery>;
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
  const queryData = usePreloadedQuery<documentsQuery>(
    DocumentsListQuery,
    queryRef
  );

  const [data, refetch] = useRefetchableFragment<
    documentsQuery,
    documentsList$key
  >(documentsFragment, queryData);

  const [active, draft] = useActiveAndDraftSplit<
    documentItem_fragment$data,
    documentItem_fragment$key
  >(data?.documents.edges, documentItem);

  const connectionId = data?.documents.__id;

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

  const handleRefetchData = (args?: Partial<documentsQuery$variables>) => {
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
              totalCount={data.documents.totalCount}
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
