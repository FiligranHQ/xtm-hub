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
import { serviceList_fragment$data } from '../../../__generated__/serviceList_fragment.graphql';
import {
  communitiesListFragment,
  ServiceCommunityListQuery,
  subscription,
} from '@/components/service/service.graphql';
import { Badge, Button } from 'filigran-ui/servers';
import Loader from '@/components/loader';
import { DataTable, useToast } from 'filigran-ui/clients';
import { ColumnDef, ColumnSort, PaginationState } from '@tanstack/react-table';
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
import {
  OrderingMode,
  ServiceOrdering,
  serviceQuery$variables,
} from '../../../__generated__/serviceQuery.graphql';
import { serviceCommunitiesQuery } from '../../../__generated__/serviceCommunitiesQuery.graphql';
import { serviceCommunityList_services$key } from '../../../__generated__/serviceCommunityList_services.graphql';

interface CommunityProps {
  queryRef: PreloadedQuery<serviceCommunitiesQuery>;
  connectionId?: string;
  shouldDisplayOnlyOwnedService?: boolean;
}

const CommunityList: React.FunctionComponent<CommunityProps> = ({
  queryRef,
  connectionId = '',
  shouldDisplayOnlyOwnedService = false,
}) => {
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const { toast } = useToast();
  const [commitSubscriptionCreateMutation] =
    useMutation<subscriptionCreateMutation>(AddSubscriptionMutation);
  const { me } = useContext<Portal>(portalContext);
  if (!me) {
    return;
  }
  const addSubscriptionInDb = (service: serviceList_fragment$data) => {
    setIsSubscriptionLoading(true);
    const handleSuccess = (message: string) => {
      setIsSubscriptionLoading(false);
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
          connections: [connectionId],
          service_id: service.id,
          organization_id: me.organization.id,
          user_id: me.id,
          status: status,
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
                  onClickContinue={useCallback(
                    () => addSubscriptionInDb(row.original),
                    []
                  )}>
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

  const queryData = usePreloadedQuery<serviceCommunitiesQuery>(
    ServiceCommunityListQuery,
    queryRef
  );
  const [data, refetch] = useRefetchableFragment<
    serviceCommunitiesQuery,
    serviceCommunityList_services$key
  >(communitiesListFragment, queryData);

  const connectionID = data?.communities?.__id;
  const config = useMemo(
    () => ({
      variables: { connections: [connectionID] },
      subscription,
    }),
    [connectionID]
  );

  useSubscription(config);
  let servicesData = data.communities.edges.map(
    ({ node }) => node
  ) as serviceList_fragment$data[];

  if (shouldDisplayOnlyOwnedService && ownedServices) {
    servicesData = ownedServices as serviceList_fragment$data[];
  }
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: Number(localStorage.getItem('countServiceList')),
  });
  const handleRefetchData = (args?: Partial<serviceQuery$variables>) => {
    const sorting = [
      {
        id: localStorage.getItem('orderByServiceList'),
        desc: localStorage.getItem('orderModeServiceList') === 'desc',
      } as unknown as ColumnSort,
    ];
    refetch({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      orderBy: localStorage.getItem('orderByServiceList') as ServiceOrdering,
      orderMode: localStorage.getItem('orderModeServiceList') as OrderingMode,
      ...transformSortingValueToParams(sorting),
      ...args,
    });
  };

  // https://tanstack.com/table/latest/docs/framework/react/guide/table-state#2-updaters-can-either-be-raw-values-or-callback-functions
  const onSortingChange = (updater: unknown) => {
    const sorting = [
      {
        id: localStorage.getItem('orderByServiceList'),
        desc: localStorage.getItem('orderModeServiceList') === 'desc',
      },
    ];
    const newSortingValue =
      updater instanceof Function ? updater(sorting) : updater;
    localStorage.setItem('orderByServiceList', newSortingValue[0].id);
    localStorage.setItem(
      'orderModeServiceList',
      newSortingValue[0].desc ? 'desc' : 'asc'
    );
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
  };

  return (
    <>
      {isSubscriptionLoading ? (
        <Loader />
      ) : (
        <>
          {data.communities.edges.length > 0 ? (
            <React.Suspense fallback={<Loader />}>
              <DataTable
                data={servicesData}
                columns={columns}
                tableOptions={{
                  onSortingChange: onSortingChange,
                  onPaginationChange: onPaginationChange,
                  manualPagination: true,
                  rowCount: data.communities.totalCount,
                  manualSorting: true,
                }}
                tableState={{
                  sorting: [
                    {
                      id: localStorage.getItem('orderByServiceList') ?? '',
                      desc:
                        localStorage.getItem('orderModeServiceList') === 'desc',
                    },
                  ],
                  pagination,
                }}
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

export default CommunityList;
