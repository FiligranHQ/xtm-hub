import {
  ServiceListFilterKey,
  ServiceListFilterMap,
} from '@/components/service/components/header/ServiceListHeader';
import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import { AppServiceContext } from '@/components/service/components/ServiceContext';
import ServiceList from '@/components/service/components/ServiceList';
import { AppServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import { useIntegrationListStorage } from '@/components/service/integrations/[serviceInstanceId]/use-integration-list-storage';
import { PaginationControls } from '@/components/ui/pagination/PaginationControls';
import { IntegrationDeployableFilter } from '@/components/ui/shareable-resource/integration/IntegrationDeployableFilter';
import { IntegrationFilters } from '@/components/ui/shareable-resource/integration/IntegrationFilters';
import { IntegrationLicenseTypeFilter } from '@/components/ui/shareable-resource/integration/IntegrationLicenseTypeFilter';
import { IntegrationSolutionCategoryFilter } from '@/components/ui/shareable-resource/integration/IntegrationSolutionCategoryFilter';
import { ProductVersionFilter } from '@/components/ui/shareable-resource/ProductVersionFilter';
import { PlatformIdentifier } from '@graphql/generated';

import {
  documentItem,
  documentsFragment,
  DocumentsListQuery,
} from '@/components/service/document/document.graphql';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import { IntegrationVerifiedFilter } from '@/components/ui/shareable-resource/integration/IntegrationVerifiedFilter';
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
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PaginationState } from '@tanstack/react-table';
import { useState } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

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

  const {
    removeIntegrationTypes,
    removeProductVersions,
    removeLicenseTypes,
    removeSolutionCategories,
    removeDeployable,
    removeVerified,
    pageSize,
    setPageSize,
    localStorageKey,
  } = useIntegrationListStorage();

  const filters: ServiceListFilterMap = {
    [ServiceListFilterKey.IntegrationType]: {
      node: <IntegrationFilters />,
      reset: () => {
        removeIntegrationTypes();
      },
    },
    [ServiceListFilterKey.ProductVersion]: {
      node: (
        <ProductVersionFilter platformIdentifier={PlatformIdentifier.Opencti} />
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
    [ServiceListFilterKey.SolutionCategory]: {
      node: <IntegrationSolutionCategoryFilter />,
      reset: removeSolutionCategories,
    },
    [ServiceListFilterKey.LicenseType]: {
      node: <IntegrationLicenseTypeFilter />,
      reset: removeLicenseTypes,
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
