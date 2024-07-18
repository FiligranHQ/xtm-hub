'use client';

import {
  pageLoaderServiceQuery,
  pageLoaderServiceQuery$variables,
} from '../../../__generated__/pageLoaderServiceQuery.graphql';
import * as React from 'react';
import { useContext, useMemo, useState } from 'react';
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
  servicesListFragment,
  subscription,
} from '@/components/service/service.graphql';
import { Badge, Button } from 'filigran-ui/servers';
import { ServiceListQuery } from '../../../app/(application)/(user)/service/page-loader';
import Loader from '@/components/loader';
import { DataTable, useToast } from 'filigran-ui/clients';
import {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import Link from 'next/link';
import { transformSortingValueToParams } from '@/components/ui/handle-sorting.utils';
import { AddSubscriptionMutation } from '@/components/subcription/subscription.graphql';
import { subscriptionCreateMutation } from '../../../__generated__/subscriptionCreateMutation.graphql';
import { Portal, portalContext } from '@/components/portal-context';
import useGranted from '@/hooks/useGranted';
import GuardCapacityComponent from '@/components/admin-guard';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { getSubscriptionsByOrganization } from '@/components/subcription/subscription.service';
import {
  CaseRftIcon,
  ConstructionIcon,
  CourseOfActionIcon,
  IndicatorIcon,
  TaskIcon,
} from 'filigran-icon';

interface ServiceProps {
  queryRef: PreloadedQuery<pageLoaderServiceQuery>;
  connectionId?: string;
  shouldDisplayOnlyOwnedService?: boolean;
}

const ServiceList: React.FunctionComponent<ServiceProps> = ({
  queryRef,
  connectionId = '',
  shouldDisplayOnlyOwnedService = false,
}) => {
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const { toast } = useToast();
  const [commitSubscriptionCreateMutation] =
    useMutation<subscriptionCreateMutation>(AddSubscriptionMutation);
  const DEFAULT_ITEM_BY_PAGE = 50;
  const { me } = useContext<Portal>(portalContext);
  if (!me) {
    return;
  }
  const addSubscriptionInDb = (service: serviceList_fragment$data) => {
    setIsSubscriptionLoading(true);
    if (service.subscription_service_type === 'SUBSCRIPTABLE_DIRECT') {
      commitSubscriptionCreateMutation({
        variables: {
          connections: [connectionId],
          service_id: service.id,
          organization_id: me.organization.id,
          user_id: me.id,
          status: 'ACCEPTED',
        },
        onCompleted: ({}) => {
          setIsSubscriptionLoading(false);
          toast({
            title: 'Success',
            description: (
              <>
                {
                  'You have successfully subscribed to the service. You can now find it in you subscribed services.'
                }
              </>
            ),
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
    } else {
      commitSubscriptionCreateMutation({
        variables: {
          connections: [connectionId],
          service_id: service.id,
          organization_id: me.organization.id,
          user_id: me.id,
          status: 'REQUESTED',
        },
        onCompleted: ({}) => {
          setIsSubscriptionLoading(false);
          toast({
            title: 'Success',
            description: (
              <>
                {
                  'Your request has been sent. You will soon be in touch with our team.'
                }
              </>
            ),
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
    }
  };

  const generateAlertText = (service: serviceList_fragment$data) => {
    return service.subscription_service_type === 'SUBSCRIPTABLE_DIRECT'
      ? 'Are you really sure you want to subscribe this service ? This action can not be undone.'
      : 'You are going to be contacted by our commercial team to subscribe this service. Do you want to continue ?';
  };

  const [subscriptionsOrganization, refetchSubOrga] =
    getSubscriptionsByOrganization();
  connectionId = subscriptionsOrganization.subscriptionsByOrganization.__id;
  const subscribedServiceName =
    subscriptionsOrganization.subscriptionsByOrganization.edges.map(
      (subscription) => subscription.node.service?.name
    );

  const ownedServices =
    subscriptionsOrganization.subscriptionsByOrganization.edges.map(
      (subscription) => subscription.node.service
    );

  let columnsAdmin: ColumnDef<serviceList_fragment$data>[] = [
    {
      id: 'action',
      size: 30,
      enableHiding: false,
      enableSorting: false,
      enableResizing: false,
      cell: ({ row }) => {
        return (
          <>
            {subscribedServiceName.includes(row.original.name) ? (
              <Button
                asChild
                className="w-3/4">
                <Link
                  href={`${row.original?.link?.url}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow">
                  {' '}
                  <IndicatorIcon className="mr-2 h-5 w-5" />
                  View more
                </Link>
              </Button>
            ) : (
              <GuardCapacityComponent
                capacityRestriction={['FRT_SERVICE_SUBSCRIBER']}>
                <AlertDialogComponent
                  AlertTitle={'Subscribe service'}
                  actionButtonText={'Continue'}
                  triggerElement={
                    <Button
                      aria-label="Subscribe service"
                      className="w-3/4">
                      <ConstructionIcon className="mr-2 h-5 w-5" />
                      Subscribe
                    </Button>
                  }
                  onClickContinue={() => addSubscriptionInDb(row.original)}>
                  {generateAlertText(row.original)}
                </AlertDialogComponent>
              </GuardCapacityComponent>
            )}
            <GuardCapacityComponent
              capacityRestriction={['BCK_MANAGE_SERVICES']}>
              <Button
                asChild
                className="mt-2 w-3/4">
                <Link href={`/admin/service/${row.original.id}`}>
                  <CourseOfActionIcon className="mr-2 h-5 w-5" />
                  Manage
                </Link>
              </Button>{' '}
            </GuardCapacityComponent>
          </>
        );
      },
    },
  ];

  let columns: ColumnDef<serviceList_fragment$data>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            <div>
              {subscribedServiceName.includes(row.original.name) ? (
                <TaskIcon className="h-6 w-6 flex-auto text-green" />
              ) : (
                <CaseRftIcon className="h-6 w-6 flex-auto text-destructive" />
              )}
            </div>
            <div>{row.original.name} </div>
          </div>
        );
      },
    },
    {
      id: 'type',
      size: 30,
      header: 'Type',
      cell: ({ row }) => {
        return <Badge className={'cursor-default'}>{row.original.type}</Badge>;
      },
    },
    {
      accessorKey: 'provider',
      id: 'provider',
      size: 30,
      header: 'Provider',
    },
    {
      size: 300,
      accessorKey: 'description',
      id: 'description',
      header: 'Description',
    },

    ...(useGranted('FRT_SERVICE_SUBSCRIBER') ? columnsAdmin : []),
  ];

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_ITEM_BY_PAGE,
  });
  const queryData = usePreloadedQuery<pageLoaderServiceQuery>(
    ServiceListQuery,
    queryRef
  );
  const [data, refetch] = useRefetchableFragment<
    pageLoaderServiceQuery,
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
  let servicesData = data.services.edges.map(
    ({ node }) => node
  ) as serviceList_fragment$data[];

  if (shouldDisplayOnlyOwnedService && ownedServices) {
    servicesData = ownedServices as serviceList_fragment$data[];
  }

  const handleRefetchData = (
    args?: Partial<pageLoaderServiceQuery$variables>
  ) => {
    refetch({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      orderBy: 'name',
      orderMode: 'asc',
      ...transformSortingValueToParams(sorting),
      ...args,
    });
  };

  const totalPages = Math.ceil(data.services.totalCount / DEFAULT_ITEM_BY_PAGE);
  const [sorting, setSorting] = useState<SortingState>([]);

  // https://tanstack.com/table/latest/docs/framework/react/guide/table-state#2-updaters-can-either-be-raw-values-or-callback-functions
  const onSortingChange = (updater: unknown) => {
    const newSortingValue =
      updater instanceof Function ? updater(sorting) : updater;
    handleRefetchData(transformSortingValueToParams(newSortingValue));
    setSorting(updater as SortingState);
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

  return (
    <>
      {isSubscriptionLoading ? (
        <Loader />
      ) : (
        <>
          {data.services.edges.length > 0 ? (
            <React.Suspense fallback={<Loader />}>
              <DataTable
                data={servicesData}
                columns={columns}
                tableOptions={{
                  onSortingChange: onSortingChange,
                  onPaginationChange: onPaginationChange,
                  manualPagination: true,
                  rowCount: data.services.totalCount,
                  manualSorting: true,
                }}
                tableState={{ sorting, pagination }}
              />
            </React.Suspense>
          ) : (
            'You do not have any service... Yet !'
          )}
        </>
      )}
    </>
  );
};

export default ServiceList;
