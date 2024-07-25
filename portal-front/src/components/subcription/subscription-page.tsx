'use client';

import * as React from 'react';
import { useCallback, useState } from 'react';
import { getSubscriptions } from '@/components/subcription/subscription.service';
import { subscriptionItem_fragment$data } from '../../../__generated__/subscriptionItem_fragment.graphql';
import { FormatDate } from '@/utils/date';
import {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { DataTable, useToast } from 'filigran-ui/clients';
import { PreloadedQuery, useMutation } from 'react-relay';
import { SubscriptionEditMutation } from '@/components/subcription/subscription.graphql';
import { subscriptionEditMutation } from '../../../__generated__/subscriptionEditMutation.graphql';
import {
  OrderingMode,
  SubscriptionOrdering,
  subscriptionsSelectQuery,
} from '../../../__generated__/subscriptionsSelectQuery.graphql';
import { Button } from 'filigran-ui/servers';
import { AddIcon, CheckIcon, LittleArrowIcon } from 'filigran-icon';
import { transformSortingValueToParams } from '@/components/ui/handle-sorting.utils';
import { SubscriptionsPaginationQuery$variables } from '../../../__generated__/SubscriptionsPaginationQuery.graphql';
import { SubscriptionFormSheet } from '@/components/subcription/subscription-form-sheet';

interface SubscriptionListProps {
  queryRef: PreloadedQuery<subscriptionsSelectQuery>;
  columns: ColumnDef<subscriptionItem_fragment$data>[];
}

const SubscriptionPage: React.FunctionComponent<SubscriptionListProps> = ({
  queryRef,
  columns,
}) => {
  const columnsWithAdmin: ColumnDef<subscriptionItem_fragment$data>[] = [
    ...columns,
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <>
            {row.original.status === 'REQUESTED' ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => editSubscription('ACCEPTED', row.original)}>
                  <CheckIcon className="h-6 w-6 flex-auto text-green" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => editSubscription('REFUSED', row.original)}>
                  <LittleArrowIcon className="h-6 w-6 flex-auto text-red" />
                </Button>
              </>
            ) : (
              <></>
            )}
          </>
        );
      },
    },
  ];

  const [subscriptions, refetch] = getSubscriptions(queryRef);

  const [sorting, setSorting] = useState<SortingState>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const connectionId = subscriptions.subscriptions.__id;
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

  const [commitSubscriptionMutation] = useMutation<subscriptionEditMutation>(
    SubscriptionEditMutation
  );
  const { toast } = useToast();

  const editSubscription = useCallback(
    (status: string, subscription: subscriptionItem_fragment$data) => {
      if (!subscription.organization || !subscription.service) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{'Error while editing the subscription.'}</>,
        });
        return;
      }
      commitSubscriptionMutation({
        variables: {
          input: {
            id: subscription.id,
            organization_id: subscription.organization.id,
            service_id: subscription.service.id,
            status: status,
          },
          id: subscription.id,
        },
        onCompleted: () => {
          toast({
            title: 'Success',
            description: <>{'Subscription accepted'}</>,
          });
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: <>{error.message}</>,
          });
        },
      });
    },
    []
  );

  return (
    <>
      <DataTable
        data={subscriptionData}
        columns={columnsWithAdmin}
        tableOptions={{
          onSortingChange: onSortingChange,
          onPaginationChange: onPaginationChange,
          manualPagination: true,
          rowCount: subscriptions.subscriptions.totalCount,
          manualSorting: true,
        }}
        tableState={{ sorting, pagination }}
      />
      <SubscriptionFormSheet
        connectionId={connectionId}
        trigger={
          <Button
            size="icon"
            className="absolute bottom-4 right-4 z-10 rounded-3xl drop-shadow-xl">
            <AddIcon className="h-4 w-4" />
          </Button>
        }></SubscriptionFormSheet>
    </>
  );
};
export default SubscriptionPage;
