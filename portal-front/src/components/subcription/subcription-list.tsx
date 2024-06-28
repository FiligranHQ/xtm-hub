'use client';

import * as React from 'react';
import { useState } from 'react';
import { getSubscriptions } from '@/components/subcription/subscription.service';
import {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { subscriptionItem_fragment$data } from '../../../__generated__/subscriptionItem_fragment.graphql';
import Loader from '@/components/loader';
import { DataTable } from 'filigran-ui/clients';
import { transformSortingValueToParams } from '@/components/ui/handle-sorting.utils';
import { OrderingMode } from '../../../__generated__/pageLoaderUserQuery.graphql';
import { SubscriptionsPaginationQuery$variables } from '../../../__generated__/SubscriptionsPaginationQuery.graphql';
import { SubscriptionOrdering } from '../../../__generated__/subscriptionsSelectQuery.graphql';
import { FormatDate } from '@/utils/date';

const columns: ColumnDef<subscriptionItem_fragment$data>[] = [
  {
    accessorKey: 'start_date',
    id: 'start_date',
    header: 'Start Date',
  },
  {
    accessorKey: 'end_date',
    id: 'end_date',
    header: 'End Date',
  },
  {
    accessorKey: 'organization.name',
    id: 'organization_name',
    header: 'Organization',
  },
  {
    accessorKey: 'service.name',
    id: 'service_name',
    header: 'Service',
  },
];

interface SubscriptionListProps {}

const SubscriptionList: React.FunctionComponent<
  SubscriptionListProps
> = ({}) => {
  const [subscriptions, refetch] = getSubscriptions();

  const onSortingChange = (updater: unknown) => {
    const newSortingValue =
      updater instanceof Function ? updater(sorting) : updater;

    handleRefetchData(
      transformSortingValueToParams<SubscriptionOrdering, OrderingMode>(
        newSortingValue
      )
    );
    setSorting(updater as SortingState);
  };
  const [sorting, setSorting] = useState<SortingState>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const handleRefetchData = (
    args?: Partial<SubscriptionsPaginationQuery$variables>
  ) => {
    refetch({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      orderBy: 'start_date',
      orderMode: 'asc',
      ...transformSortingValueToParams(sorting),
      ...args,
    });
  };

  const onPaginationChange = (updater: unknown) => {
    const newPaginationValue: PaginationState =
      updater instanceof Function ? updater(pagination) : updater;
    handleRefetchData({
      count: newPaginationValue.pageSize,
      cursor: btoa(
        String(newPaginationValue.pageSize * newPaginationValue.pageIndex)
      ),
    });
    setPagination(newPaginationValue);
  };

  let subscriptionData = subscriptions.subscriptions.edges.map(({ node }) => ({
    ...node,
  })) as subscriptionItem_fragment$data[];

  subscriptionData = subscriptionData.map((data) => {
    return {
      ...data,
      start_date: FormatDate(data.start_date, false),
      end_date: FormatDate(data.end_date, false),
    };
  });

  return (
    <>
      <React.Suspense fallback={<Loader />}>
        <DataTable
          data={subscriptionData}
          columns={columns}
          tableOptions={{
            onSortingChange: onSortingChange,
            onPaginationChange: onPaginationChange,
            manualPagination: true,
            rowCount: subscriptions.subscriptions.totalCount,
            manualSorting: true,
          }}
          tableState={{ sorting, pagination }}
        />
      </React.Suspense>
    </>
  );
};
export default SubscriptionList;
