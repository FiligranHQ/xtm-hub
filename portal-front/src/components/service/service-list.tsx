'use client';

import * as React from 'react';
import { useCallback, useContext, useMemo, useState } from 'react';
import {
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  useRefetchableFragment,
  useSubscription,
} from 'react-relay';
import { serviceList_services$key } from '../../../__generated__/serviceList_services.graphql';
import { serviceList_fragment$data } from '../../../__generated__/serviceList_fragment.graphql';
import {
  ServiceListQuery,
  servicesListFragment,
  subscription,
} from '@/components/service/service.graphql';
import { Button } from 'filigran-ui/servers';
import { DataTable, useToast } from 'filigran-ui/clients';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import Link from 'next/link';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { AddSubscriptionMutation } from '@/components/subcription/subscription.graphql';
import { subscriptionCreateMutation } from '../../../__generated__/subscriptionCreateMutation.graphql';
import { Portal, portalContext } from '@/components/portal-context';
import GuardCapacityComponent from '@/components/admin-guard';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { ConstructionIcon, EditIcon } from 'filigran-icon';
import {
  OrderingMode,
  ServiceOrdering,
  serviceQuery,
  serviceQuery$variables,
} from '../../../__generated__/serviceQuery.graphql';
import { useLocalStorage } from 'usehooks-ts';
import useGranted from '@/hooks/useGranted';

interface ServiceProps {
  queryRef: PreloadedQuery<serviceQuery>;
  columns: ColumnDef<serviceList_fragment$data>[];
}

const ServiceList: React.FunctionComponent<ServiceProps> = ({
  queryRef,
  columns,
}) => {
  const [pageSize, setPageSize] = useLocalStorage('countServiceList', 50);
  const [orderMode, setOrderMode] = useLocalStorage<OrderingMode>(
    'orderModeServiceList',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage<ServiceOrdering>(
    'orderByServiceList',
    'name'
  );
  const queryData = usePreloadedQuery<serviceQuery>(ServiceListQuery, queryRef);
  const [data, refetch] = useRefetchableFragment<
    serviceQuery,
    serviceList_services$key
  >(servicesListFragment, queryData);

  const connectionID = data?.services?.__id;
  const config = useMemo(
    () => ({
      variables: { connections: [connectionID] },
      subscription,
    }),
    [connectionID]
  );
  useSubscription(config);
  const { toast } = useToast();
  const [commitSubscriptionCreateMutation] =
    useMutation<subscriptionCreateMutation>(AddSubscriptionMutation);
  const { me } = useContext<Portal>(portalContext);
  if (!me) {
    return;
  }
  const addSubscriptionInDb = useCallback(
    (service: serviceList_fragment$data) => {
      const handleSuccess = (message: string) => {
        toast({
          title: 'Success',
          description: <>{message}</>,
        });
      };
      const handleError = (error: Error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      };

      const commitMutation = (status: string, successMessage: string) => {
        commitSubscriptionCreateMutation({
          variables: {
            connections: [connectionID],
            service_id: service.id,
          },
          onCompleted: () => handleSuccess(successMessage),
          onError: (error: Error) => handleError(error),
        });
      };

      if (service.subscription_service_type === 'SUBSCRIPTABLE_DIRECT') {
        commitMutation(
          'ACCEPTED',
          'You have successfully subscribed to the service. You can now find it in your subscribed services.'
        );
      } else {
        commitMutation(
          'REQUESTED',
          'Your request has been sent. You will soon be in touch with our team.'
        );
      }
    },
    [connectionID]
  );

  const generateAlertText = (service: serviceList_fragment$data) => {
    return service.subscription_service_type === 'SUBSCRIPTABLE_DIRECT'
      ? 'Are you really sure you want to subscribe this service ? This action can not be undone.'
      : 'You are going to be contacted by our commercial team to subscribe this service. Do you want to continue ?';
  };

  const editColumn: ColumnDef<serviceList_fragment$data>[] = useMemo(
    () =>
      useGranted('BCK_MANAGE_SERVICES')
        ? [
            {
              id: 'edit',
              size: 30,
              enableHiding: false,
              enableSorting: false,
              enableResizing: false,
              cell: ({ row }) => {
                return (
                  <>
                    <GuardCapacityComponent
                      capacityRestriction={['BCK_MANAGE_SERVICES']}>
                      <Button
                        asChild
                        variant={'ghost'}
                        size={'icon'}>
                        <Link href={`/admin/service/${row.original.id}`}>
                          <EditIcon className="h-4 w-4" />
                        </Link>
                      </Button>{' '}
                    </GuardCapacityComponent>
                  </>
                );
              },
            },
          ]
        : [],
    []
  );
  const subscribeColumns: ColumnDef<serviceList_fragment$data>[] = useMemo(
    () =>
      useGranted('FRT_SERVICE_SUBSCRIBER')
        ? [
            {
              id: 'action',
              size: 30,
              enableHiding: false,
              enableSorting: false,
              enableResizing: false,
              cell: ({ row }) => {
                return row.original.subscribed ? null : (
                  <AlertDialogComponent
                    AlertTitle={'Subscribe service'}
                    actionButtonText={'Continue'}
                    triggerElement={
                      <Button aria-label="Subscribe service">Subscribe</Button>
                    }
                    onClickContinue={useCallback(
                      () => addSubscriptionInDb(row.original),
                      []
                    )}>
                    {generateAlertText(row.original)}
                  </AlertDialogComponent>
                );
              },
            },
          ]
        : [],
    []
  );

  const servicesData = data.services.edges.map(
    ({ node }) => node
  ) as serviceList_fragment$data[];

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const handleRefetchData = (args?: Partial<serviceQuery$variables>) => {
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

  // https://tanstack.com/table/latest/docs/framework/react/guide/table-state#2-updaters-can-either-be-raw-values-or-callback-functions
  const onSortingChange = (updater: unknown) => {
    const sorting = mapToSortingTableValue(orderBy, orderMode);
    const newSortingValue =
      updater instanceof Function ? updater(sorting) : updater;
    setOrderBy(newSortingValue[0].id);
    setOrderMode(newSortingValue[0].desc ? 'desc' : 'asc');
    handleRefetchData(transformSortingValueToParams(newSortingValue));
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

  const dataColumns: ColumnDef<serviceList_fragment$data>[] = useMemo(
    () => [...columns, ...subscribeColumns, ...editColumn],
    [columns, subscribeColumns]
  );
  return (
    <>
      {data.services.edges.length > 0 ? (
        <React.Suspense
          fallback={
            <DataTable
              data={[]}
              isLoading={true}
              columns={dataColumns}
            />
          }>
          <DataTable
            data={servicesData}
            columns={dataColumns}
            tableOptions={{
              onSortingChange: onSortingChange,
              onPaginationChange: onPaginationChange,
              manualPagination: true,
              rowCount: data.services.totalCount,
              manualSorting: true,
            }}
            tableState={{
              sorting: mapToSortingTableValue(orderBy, orderMode),
              columnPinning: {
                right: ['action', 'edit'],
              },
              pagination,
            }}
          />
        </React.Suspense>
      ) : (
        'There is any service... Yet !'
      )}
    </>
  );
};

export default ServiceList;
