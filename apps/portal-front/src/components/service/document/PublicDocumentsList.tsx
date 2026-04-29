import {
  publicDocumentItem,
  PublicDocumentListQuery,
} from '@/components/service/document/public-document.graphql';
import { ServiceSlug } from '@/utils/shareable-resources/shareable-resources.types';
import { useShareableResourceMapping } from '@/utils/shareable-resources/use-shareable-resource-mapping';
import { publicDocumentItemFragment$key } from '@generated/publicDocumentItemFragment.graphql';
import publicDocumentListGraphql, {
  publicDocumentList$key,
} from '@generated/publicDocumentList.graphql';
import {
  publicDocumentsQuery,
  publicDocumentsQuery$variables,
} from '@generated/publicDocumentsQuery.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { PaginationState } from '@tanstack/react-table';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  PreloadedQuery,
  readInlineData,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import useScrollPosition from '@/hooks/use-scroll-position';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';
import { PaginationControls } from '@/components/ui/pagination/PaginationControls';
import { PublicShareableResourceList } from '@/components/ui/shareable-resource/PublicShareableResourceList';
import { ServiceListHeader } from '@/components/service/components/header/ServiceListHeader';
import { AppServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';

interface Props {
  serviceInstance: seoServiceInstanceFragment$data;
  queryRef: PreloadedQuery<publicDocumentsQuery>;
  baseUrl: string;
}

const PublicDocumentsList: React.FC<Props> = ({
  queryRef,
  serviceInstance,
  baseUrl,
}) => {
  const queryData = usePreloadedQuery<publicDocumentsQuery>(
    PublicDocumentListQuery,
    queryRef
  );

  const [data, refetch] = useRefetchableFragment<
    publicDocumentsQuery,
    publicDocumentList$key
  >(publicDocumentListGraphql, queryData);

  const documents = useMemo(() => {
    return (data.publicDocuments?.edges ?? [])
      .map(({ node }) =>
        readInlineData<publicDocumentItemFragment$key>(publicDocumentItem, node)
      )
      .filter((l) => !!l);
  }, [data.publicDocuments]);

  const { filters, localStorageKey } = useShareableResourceMapping(
    serviceInstance.slug as ServiceSlug
  );

  const { search, setSearch, pageSize, setPageSize } =
    useServiceListLocalStorage(localStorageKey);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const { restore } = useScrollPosition();

  useLayoutEffect(() => {
    restore();
  }, [restore]);

  const handleRefetchData = (
    args?: Partial<publicDocumentsQuery$variables>
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
            totalCount={data.publicDocuments.totalCount}
            pageSize={pageSize}
            pageIndex={pagination.pageIndex}
            onPaginationChange={onPaginationChange}
            onSetPageSize={setPageSize}
          />
        }
      />
      <PublicShareableResourceList
        documents={documents}
        serviceInstance={serviceInstance}
        baseUrl={baseUrl}
      />
    </AppServiceListLocalStorageKeyContext>
  );
};

export default PublicDocumentsList;
