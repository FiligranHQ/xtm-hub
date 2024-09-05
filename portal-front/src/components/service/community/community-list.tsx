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
import {
  communitiesListFragment,
  ServiceCommunityAcceptMutation,
  ServiceCommunityListQuery,
  subscription,
} from '@/components/service/service.graphql';
import { Badge, Button } from 'filigran-ui/servers';
import Loader from '@/components/loader';
import { DataTable, useToast } from 'filigran-ui/clients';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import Link from 'next/link';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { SubscriptionEditMutation } from '@/components/subcription/subscription.graphql';
import { Portal, portalContext } from '@/components/portal-context';
import useGranted from '@/hooks/useGranted';
import GuardCapacityComponent from '@/components/admin-guard';
import { getSubscriptionsByOrganization } from '@/components/subcription/subscription.service';
import { CheckIcon, CourseOfActionIcon, LittleArrowIcon } from 'filigran-icon';
import {
  OrderingMode,
  ServiceOrdering,
  serviceQuery$variables,
} from '../../../../__generated__/serviceQuery.graphql';
import { serviceCommunitiesQuery } from '../../../../__generated__/serviceCommunitiesQuery.graphql';
import { serviceCommunityList_services$key } from '../../../../__generated__/serviceCommunityList_services.graphql';
import { serviceCommunityList_fragment$data } from '../../../../__generated__/serviceCommunityList_fragment.graphql';
import { subscriptionItem_fragment$data } from '../../../../__generated__/subscriptionItem_fragment.graphql';
import { subscriptionEditMutation } from '../../../../__generated__/subscriptionEditMutation.graphql';
import { useLocalStorage } from 'usehooks-ts';
import { CreateCommunity } from '@/components/service/community/community-create';
import { communityAcceptFormSchema } from '@/components/service/community/community-form-schema';
import { CommunityAcceptFormSheet } from '@/components/service/community/community-accept-form-sheet';
import { z } from 'zod';
import { ServicePriceCreateMutation } from '@/components/service/service-price.graphql';
import { servicePriceMutation } from '../../../../__generated__/servicePriceMutation.graphql';
import { RESTRICTION } from '@/utils/constant';
import { serviceCommunityAcceptMutation } from '../../../../__generated__/serviceCommunityAcceptMutation.graphql';
import { ServiceTypeBadge } from '@/components/ui/service-type-badge';

interface CommunityProps {
  queryRef: PreloadedQuery<serviceCommunitiesQuery>;
  connectionId?: string;
  shouldDisplayOnlyOwnedService?: boolean;
}

//TODO : Remove me.context and avoid when possible optional value in GraphqlTyping ex: ServiceType
const CommunityList: React.FunctionComponent<CommunityProps> = ({
  queryRef,
  connectionId = '',
  shouldDisplayOnlyOwnedService = false,
}) => {
  // TODO: use useTransition instead https://react.dev/reference/react/useTransition
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const [pageSize, setPageSize] = useLocalStorage('countCommunitiesList', 50);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [openSheet, setOpenSheet] = useState(false);
  const [justification, setJustification] = useState('');
  const [mainOrganization, setMainOrganization] = useState({
    id: '',
    name: '',
  });
  const [serviceDataOnGoingCommunity, setServiceDataOnGoingCommunity] =
    useState<serviceCommunityList_fragment$data>();

  const [orderBy, setOrderBy] = useLocalStorage<ServiceOrdering>(
    'orderModeCommunitiesList',
    'name'
  );
  const [orderMode, setOrderMode] = useLocalStorage<OrderingMode>(
    'orderByCommunitiesList',
    'asc'
  );
  const { toast } = useToast();
  const [commitServiceCommunityAcceptMutation] =
    useMutation<serviceCommunityAcceptMutation>(ServiceCommunityAcceptMutation);
  const { me } = useContext<Portal>(portalContext);
  if (!me) {
    return;
  }

  const [subscriptionsOrganization, refetchSubOrga] =
    getSubscriptionsByOrganization();
  connectionId = subscriptionsOrganization.subscriptionsByOrganization.__id;
  const ownedServices =
    subscriptionsOrganization.subscriptionsByOrganization.edges.map(
      (subscription) => subscription.node.service
    );

  const columnsAdmin: ColumnDef<serviceCommunityList_fragment$data>[] = useMemo(
    () => [
      {
        id: 'action',
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
                  className="mt-2 w-3/4">
                  <Link href={`/admin/service/${row.original.id}`}>
                    <CourseOfActionIcon className="mr-2 h-5 w-5" />
                    Manage
                  </Link>
                </Button>
              </GuardCapacityComponent>
            </>
          );
        },
      },
      {
        id: 'accept',
        size: 30,
        enableHiding: false,
        enableSorting: false,
        enableResizing: false,
        cell: ({ row }) => {
          return (
            <>
              {row.original?.subscription &&
              row.original?.subscription[0]?.status === 'REQUESTED' ? (
                <GuardCapacityComponent
                  displayError={false}
                  capacityRestriction={['BYPASS']}>
                  <Button
                    variant="ghost"
                    onClick={() => editSubscriptions('ACCEPTED', row.original)}>
                    <CheckIcon className="h-6 w-6 flex-auto text-green" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => editSubscriptions('REFUSED', row.original)}>
                    <LittleArrowIcon className="h-6 w-6 flex-auto text-red" />
                  </Button>
                </GuardCapacityComponent>
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

  const columns: ColumnDef<serviceCommunityList_fragment$data>[] = useMemo(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-2">
              {row.original.name}
            </div>
          );
        },
      },
      {
        id: 'type',
        size: 30,
        header: 'Type',
        cell: ({ row }) => (
          <>
            {row.original.type && (
              <ServiceTypeBadge type={row.original.type as ServiceTypeBadge} />
            )}
          </>
        ),
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

      {
        id: 'status',
        size: 30,
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original?.subscription &&
              row.original?.subscription[0] &&
              row.original?.subscription[0].status === 'REQUESTED'
                ? 'warning'
                : 'secondary'
            }
            className={'cursor-default'}>
            {(row.original?.subscription &&
              row.original?.subscription[0] &&
              row.original?.subscription[0].status) ??
              'ACCEPTED'}
          </Badge>
        ),
      },

      ...(useGranted('FRT_SERVICE_SUBSCRIBER') ? columnsAdmin : []),
    ],
    [columnsAdmin]
  );

  const [commitServicePriceMutation] = useMutation<servicePriceMutation>(
    ServicePriceCreateMutation
  );

  const handleAcceptCommunity = (
    values: z.infer<typeof communityAcceptFormSchema>
  ) => {
    if (!serviceDataOnGoingCommunity) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error while retrieving current community...',
      });
      return;
    }
    commitServiceCommunityAcceptMutation({
      variables: {
        input: {
          serviceId: serviceDataOnGoingCommunity.id,
          organizationsId: values.organizations_id,
        },
      },
      onCompleted: () => {},
      onError: (error: Error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });

    commitServicePriceMutation({
      variables: {
        input: {
          service_id: serviceDataOnGoingCommunity?.id,
          fee_type: values.fee_type,
          price: values.price,
        },
      },
      onCompleted: () => {},
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });

    setOpenSheet(false);
  };

  const editSubscriptions = (
    status: string,
    serviceData: serviceCommunityList_fragment$data
  ) => {
    if (serviceData.subscription) {
      setJustification(serviceData.subscription[0]?.justification ?? '');
      setMainOrganization(
        serviceData.subscription[0]?.organization ?? { id: '', name: '' }
      );
    }
    if (status === 'ACCEPTED') {
      setOpenSheet(true);
      setServiceDataOnGoingCommunity(serviceData);
    } else {
      serviceData.subscription?.forEach((subscription) => {
        editSubscription(
          status,
          subscription as unknown as subscriptionItem_fragment$data
        );
      });
    }
  };

  const [commitSubscriptionMutation] = useMutation<subscriptionEditMutation>(
    SubscriptionEditMutation
  );

  const editSubscription = useCallback(
    (status: string, subscription: subscriptionItem_fragment$data) => {
      commitSubscriptionMutation({
        variables: {
          input: { status: status },
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
    [commitSubscriptionMutation, toast]
  );

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
  ) as unknown as serviceCommunityList_fragment$data[];

  if (shouldDisplayOnlyOwnedService && ownedServices) {
    servicesData =
      ownedServices as unknown as serviceCommunityList_fragment$data[];
  }

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
  return (
    <>
      <div className="flex justify-end pb-m">
        <GuardCapacityComponent
          capacityRestriction={[
            RESTRICTION.CAPABILITY_BYPASS,
            RESTRICTION.CAPABILITY_BCK_MANAGE_COMMUNITIES,
            RESTRICTION.CAPABILITY_FRT_SERVICE_SUBSCRIBER,
          ]}>
          <CreateCommunity
            connectionId={connectionId}
            adminForm={me.capabilities.some(
              (capability) => capability.name === 'BYPASS'
            )}></CreateCommunity>
        </GuardCapacityComponent>
      </div>
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
                  sorting: mapToSortingTableValue(orderBy, orderMode),
                  pagination,
                }}
              />
            </React.Suspense>
          ) : (
            'There is any community... Yet !'
          )}

          <CommunityAcceptFormSheet
            title={'Accept a new community'}
            description={
              'Insert the billing here. Click Validate when you are done. The subscriptions will be accepted.'
            }
            justification={justification}
            handleSubmit={handleAcceptCommunity}
            open={openSheet}
            setOpen={setOpenSheet}
            mainOrganization={mainOrganization}
            validationSchema={communityAcceptFormSchema}
          />
        </>
      )}
    </>
  );
};

export default CommunityList;
