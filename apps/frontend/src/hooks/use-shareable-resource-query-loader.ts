import { DocumentsListQuery } from '@/components/service/document/document.graphql';
import {
  documentsQuery,
  documentsQuery$variables,
} from '@generated/documentsQuery.graphql';
import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';

export type UseShareableResourceQueryLoaderParams = Omit<
  documentsQuery$variables,
  'count' | 'cursor'
> & {
  /** Page size read from `useServiceListLocalStorage`. */
  pageSize: number;
};

/**
 * Mutualizes the `useQueryLoader`/`loadQuery` boilerplate duplicated across every
 * shareable-resource page-loader: loading the initial page of documents for a service
 * instance, re-triggered whenever search/order/filters change.
 */
export const useShareableResourceQueryLoader = ({
  pageSize,
  orderBy,
  orderMode,
  serviceInstanceId,
  searchTerm,
  logicalFilters,
}: UseShareableResourceQueryLoaderParams) => {
  const [queryRef, loadQuery] =
    useQueryLoader<documentsQuery>(DocumentsListQuery);

  useEffect(() => {
    loadQuery(
      {
        count: pageSize,
        orderBy,
        orderMode,
        serviceInstanceId,
        searchTerm,
        logicalFilters,
      },
      {
        fetchPolicy: 'store-and-network',
      }
    );
  }, [
    loadQuery,
    pageSize,
    orderBy,
    orderMode,
    serviceInstanceId,
    searchTerm,
    logicalFilters,
  ]);

  return queryRef;
};
