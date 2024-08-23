'use client';

import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { getSubscriptions } from '@/components/subcription/subscription.service';
import { subscriptionItem_fragment$data } from '../../../__generated__/subscriptionItem_fragment.graphql';
import { FormatDate } from '@/utils/date';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
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
import {
    mapToSortingTableValue,
    transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { SubscriptionsPaginationQuery$variables } from '../../../__generated__/SubscriptionsPaginationQuery.graphql';
import { SubscriptionFormSheet } from '@/components/subcription/subscription-form-sheet';
import { useLocalStorage } from 'usehooks-ts';
import {
    subscriptionAcceptFormSchema,
    SubscriptionAcceptFormSheet,
} from '@/components/subcription/subscription-accept-form-sheet';
import { servicePriceMutation } from '../../../__generated__/servicePriceMutation.graphql';
import { ServicePriceCreateMutation } from '@/components/service/service-price.graphql';
import { z } from 'zod';
import CreateButton from '@/components/ui/create-button';

interface SubscriptionListProps {
    queryRef: PreloadedQuery<subscriptionsSelectQuery>;
    columns: ColumnDef<subscriptionItem_fragment$data>[];
}

const SubscriptionPage: React.FunctionComponent<SubscriptionListProps> = ({
                                                                              queryRef,
                                                                              columns,
                                                                          }) => {
    const { toast } = useToast();
    const [subscriptions, refetch] = getSubscriptions(queryRef);
    const [pageSize, setPageSize] = useLocalStorage('countSubscriptionList', 50);
    const [orderMode, setOrderMode] = useLocalStorage<OrderingMode>(
        'orderModeSubscriptionList',
        'desc'
    );
    const [orderBy, setOrderBy] = useLocalStorage<SubscriptionOrdering>(
        'countSubscriptionList',
        'status'
    );

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize,
    });
    const [openSheet, setOpenSheet] = useState(false);

    const connectionId = subscriptions.subscriptions.__id;
    const subscriptionData = subscriptions.subscriptions.edges.map(
        ({ node }) => ({
            ...node,
            start_date: FormatDate(node.start_date, false),
            end_date: FormatDate(node.end_date, false),
        })
    ) as subscriptionItem_fragment$data[];

    const onSortingChange = (updater: unknown) => {
        const sorting = mapToSortingTableValue(orderBy, orderMode);
        const newSortingValue =
            updater instanceof Function ? updater(sorting) : updater;
        setOrderBy(newSortingValue[0].id);
        setOrderMode(newSortingValue[0].desc ? 'desc' : 'asc');

        handleRefetchData(
            transformSortingValueToParams<SubscriptionOrdering, OrderingMode>(
                newSortingValue
            )
        );
    };

    const handleRefetchData = (
        args?: Partial<SubscriptionsPaginationQuery$variables>
    ) => {
        const sorting = mapToSortingTableValue(orderBy, orderMode);
        refetch({
            count: pagination.pageSize,
            cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
            orderBy,
            orderMode,
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
        if (newPaginationValue.pageSize !== pageSize) {
            setPageSize(newPaginationValue.pageSize);
        }
    };
    const [commitServicePriceMutation] = useMutation<servicePriceMutation>(
        ServicePriceCreateMutation
    );

    const [commitSubscriptionMutation] = useMutation<subscriptionEditMutation>(
        SubscriptionEditMutation
    );

    const [statusOnGoingCommunity, setStatusOnGoingCommunity] = useState('');
    const [subscriptionOnGoingCommunity, setSubscriptionOnGoingCommunity] =
        useState<subscriptionItem_fragment$data>();

    const insertSubscription = (
        subscription: subscriptionItem_fragment$data | undefined,
        status: string
    ) => {
        if (
            !subscription ||
            !subscription.organization ||
            !subscription.organization.id ||
            !subscription.service ||
            !subscription.service.id
        ) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: (
                    <>
                        {
                            'Error while editing the subscription (organization or service not present).'
                        }
                    </>
                ),
            });
            return;
        }
        commitSubscriptionMutation({
            variables: {
                input: {
                    status: status,
                },
                id: subscription.id,
            },
            onCompleted: () => {
                toast({
                    title: 'Success',
                    description: <>{'Subscription accepted'}</>,
                });
                setOpenSheet(false);
            },
            onError: (error) => {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: <>{error.message}</>,
                });
            },
        });
    };
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
            if (status === 'ACCEPTED') {
                setOpenSheet(true);
                setStatusOnGoingCommunity(status);
                setSubscriptionOnGoingCommunity(subscription);
            } else {
                insertSubscription(subscription, status);
            }
        },
        [commitSubscriptionMutation, toast]
    );
    const handleAcceptSubscription = (
        values: z.infer<typeof subscriptionAcceptFormSchema>
    ) => {
        commitServicePriceMutation({
            variables: {
                input: {
                    service_id: subscriptionOnGoingCommunity?.service?.id,
                    fee_type: values.fee_type,
                    price: values.price,
                },
            },
            onCompleted: () => {
                insertSubscription(
                    subscriptionOnGoingCommunity,
                    statusOnGoingCommunity
                );
            },
            onError: (error) => {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: <>{error.message}</>,
                });
            },
        });
    };

    const columnsWithAdmin: ColumnDef<subscriptionItem_fragment$data>[] = useMemo(
        () => [
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
        ],
        []
    );

  return (
    <>
      <div className="flex justify-end pb-s">
        <SubscriptionFormSheet
          connectionId={connectionId}
          trigger={<CreateButton label="Add subscription" />}
        />
      </div>

      <DataTable
        data={subscriptionData}
        columns={columnsWithAdmin}
        tableOptions={{
          onSortingChange: onSortingChange,
          onPaginationChange: onPaginationChange,
          rowCount: subscriptions.subscriptions.totalCount,
          manualPagination: true,
          manualSorting: true,
        }}
        tableState={{
          sorting: mapToSortingTableValue(orderBy, orderMode),
          pagination,
        }}
      />

      <SubscriptionAcceptFormSheet
        title={'Accept a new community'}
        description={
          'Insert the billing here. Click Validate when you are done. The subscriptions will be accepted.'
        }
        handleSubmit={handleAcceptSubscription}
        open={openSheet}
        setOpen={setOpenSheet}
      />
    </>
  );
};
export default SubscriptionPage;
