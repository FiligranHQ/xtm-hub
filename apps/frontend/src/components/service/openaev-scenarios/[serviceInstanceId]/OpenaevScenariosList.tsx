import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import { AppServiceContext } from '@/components/service/components/ServiceContext';
import ServiceList from '@/components/service/components/ServiceList';

import { AppServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import {
  documentItem,
  documentsFragment,
  DocumentsListQuery,
} from '@/components/service/document/document.graphql';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import { PaginationControls } from '@/components/ui/pagination/PaginationControls';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
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

interface OpenAEVScenariosListProps {
  queryRef: PreloadedQuery<documentsQuery>;
  serviceInstance: serviceInstance_fragment$data;
  search: string;
  onSearchChange: (v: string) => void;
}

const OpenaevScenariosList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
}: OpenAEVScenariosListProps) => {
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
    type: ShareableResourceType.OPENAEV_SCENARIO,
  });

  const { pageSize, setPageSize } = useServiceListLocalStorage(
    ServiceListLocalStorageKey.OpenAEVScenarios
  );

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
      <AppServiceListLocalStorageKeyContext
        localStorageKey={ServiceListLocalStorageKey.OpenAEVScenarios}>
        <ServiceList
          active={active}
          draft={draft}
          search={search}
          onSearchChange={onSearchChange}
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

export default OpenaevScenariosList;
