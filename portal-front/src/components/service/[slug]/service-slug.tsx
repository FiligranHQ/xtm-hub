import {
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import { DataTable, useToast } from 'filigran-ui/clients';
import * as React from 'react';
import { FunctionComponent, useMemo, useState } from 'react';
import { Badge, Button } from 'filigran-ui/servers';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { ServiceSlugFormSheet } from '@/components/service/[slug]/service-slug-form-sheet';
import { ChevronIcon, DeleteIcon, LittleArrowIcon } from 'filigran-icon';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { userServiceDeleteMutation } from '../../../../__generated__/userServiceDeleteMutation.graphql';
import {
  OrderingMode,
  serviceUserSlugQuery,
  serviceUserSlugQuery$data,
  serviceUserSlugQuery$variables,
  UserServiceOrdering,
} from '../../../../__generated__/serviceUserSlugQuery.graphql';
import {
  serviceUsersFragment,
  ServiceUserSlugQuery,
} from '@/components/service/service.graphql';
import { serviceUser$key } from '../../../../__generated__/serviceUser.graphql';
import { useLocalStorage } from 'usehooks-ts';
import { UserServiceDeleteMutation } from '@/components/service/user_service.graphql';
import { RESTRICTION } from '@/utils/constant';
import GuardCapacityComponent from '@/components/admin-guard';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { SubscriptionDeleteMutation } from '@/components/subcription/subscription.graphql';
import { subscriptionDeleteMutation } from '../../../../__generated__/subscriptionDeleteMutation.graphql';
import { ServiceSlugAddOrgaFormSheet } from '@/components/service/[slug]/service-slug-add-orga-form-sheet';
import TriggerButton from '@/components/ui/trigger-button';

export interface UserServiceData extends serviceUserSlugQuery$data {
  id: string;
  service_capability: { id: string; service_capability_name: string }[];
}

interface ServiceSlugProps {
  queryRef: PreloadedQuery<serviceUserSlugQuery>;
}

const ServiceSlug: FunctionComponent<ServiceSlugProps> = ({ queryRef }) => {
  const [openSheet, setOpenSheet] = useState(false);
  const [openSheetAddOrga, setOpenSheetAddOrga] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [pageSize, setPageSize] = useLocalStorage('countServiceSlug', 50);
  const [orderMode, setOrderMode] = useLocalStorage<OrderingMode>(
    'orderModeServiceSlug',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage<UserServiceOrdering>(
    'orderByServiceSlug',
    'first_name'
  );

  const [commitUserServiceDeletingMutation] =
    useMutation<userServiceDeleteMutation>(UserServiceDeleteMutation);

  const { toast } = useToast();
  const deleteCurrentUser = (userService: any) => {
    commitUserServiceDeletingMutation({
      variables: {
        input: {
          email: userService.user.email,
          subscriptionId: subscriptionId,
        },
      },
      onCompleted() {
        refetch({
          count: pagination.pageSize,
          cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
          orderBy: 'first_name',
          orderMode: 'asc',
        });
      },
    });
  };

  const queryData = usePreloadedQuery<serviceUserSlugQuery>(
    ServiceUserSlugQuery,
    queryRef
  );

  const [data, refetch] = useRefetchableFragment<
    serviceUserSlugQuery,
    serviceUser$key
  >(serviceUsersFragment, queryData);

  const subscriptionId: string =
    data?.serviceUsers?.edges[0]?.node?.subscription?.id ?? '';

  const connectionId = data.serviceUsers?.__id ?? '';
  const usersData: UserServiceData[] =
    data?.serviceUsers?.edges.map((user) => {
      const capa_names =
        user?.node?.service_capability?.map(
          (cap) => cap?.service_capability_name
        ) ?? [];
      return {
        ...user.node,
        service_capability_names: capa_names,
      } as unknown as UserServiceData;
    }) ?? [];

  const organizations = data.serviceUsers?.edges.map((item) => {
    return {
      organization: item.node?.subscription?.organization,
      billing: item.node?.subscription?.billing,
      subscription_id: item.node?.subscription?.id,
    };
  });
  const uniqueOrganizations = organizations.filter(
    (org, index, self) =>
      index ===
      self.findIndex((t) => t?.organization?.id === org?.organization?.id)
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const handleRefetchData = (
    args?: Partial<serviceUserSlugQuery$variables>
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
  const onSortingChange = (updater: unknown) => {
    const sorting = mapToSortingTableValue(orderBy, orderMode);
    const newSortingValue =
      updater instanceof Function ? updater(sorting) : updater;

    setOrderBy(newSortingValue[0].id);
    setOrderMode(newSortingValue[0].desc ? 'desc' : 'asc');

    handleRefetchData(
      transformSortingValueToParams<UserServiceOrdering, OrderingMode>(
        newSortingValue
      )
    );
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

  const [commitSubscriptionMutation] = useMutation<subscriptionDeleteMutation>(
    SubscriptionDeleteMutation
  );

  const onRemoveOrganization = (subscription_id: string) => {
    commitSubscriptionMutation({
      variables: {
        subscription_id: subscription_id,
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

  const columns: ColumnDef<UserServiceData>[] = useMemo(
    () => [
      {
        accessorKey: 'user.first_name',
        id: 'first_name',
        header: 'First Name',
      },
      {
        accessorKey: 'user.last_name',
        id: 'last_name',
        header: 'Last Name',
      },
      {
        accessorKey: 'user.email',
        id: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'service_capability_names',
        id: 'service_capability_names',
        header: 'Capabilities',
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <>
              {row.original?.service_capability?.map((service_capa) => (
                <Badge
                  key={service_capa.id}
                  className="mb-2 mr-2 mt-2">
                  {service_capa.service_capability_name}
                </Badge>
              ))}
            </>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          return (
            <>
              <Button
                variant={'ghost'}
                onClick={() => {
                  setCurrentUser(row.original);
                  setOpenSheet(true);
                }}>
                <ChevronIcon className="h-4 w-4"></ChevronIcon>
              </Button>
              <Button
                variant={'ghost'}
                onClick={() => {
                  deleteCurrentUser(row.original);
                }}>
                <LittleArrowIcon className="h-4 w-4"></LittleArrowIcon>
              </Button>
            </>
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <GuardCapacityComponent
        capacityRestriction={[
          RESTRICTION.CAPABILITY_BYPASS,
          RESTRICTION.CAPABILITY_BCK_MANAGE_SERVICES,
          RESTRICTION.CAPABILITY_BCK_MANAGE_COMMUNITIES,
        ]}>
        <div className="flex justify-end gap-m pb-s">
          <ServiceSlugAddOrgaFormSheet
            open={openSheetAddOrga}
            setOpen={setOpenSheetAddOrga}
            trigger={<CreateButton label="Add organization" />}
          />

          <ServiceSlugFormSheet
            open={openSheet}
            setOpen={setOpenSheet}
            userService={currentUser}
            connectionId={connectionId}
            subscriptionId={subscriptionId}
            refetch={() =>
              refetch({
                count: pagination.pageSize,
                cursor: btoa(
                  String(pagination.pageSize * pagination.pageIndex)
                ),
                orderBy,
                orderMode,
              })
            }
            trigger={
              <TriggerButton
                onClick={() => setCurrentUser({})}
                label="Invite user"
              />
            }
          />
        </div>

        <ul
          className={
            'grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-m'
          }>
          {uniqueOrganizations.map(
            ({ billing, organization, subscription_id }) => {
              return (
                <li
                  className="border-light flex flex-col bg-white p-s"
                  key={organization?.id}>
                  <div className="flex-1 p-m pb-xl">
                    <div className="flex items-center justify-between">
                      <h3>Organization : {organization?.name}</h3>
                      <div className="justify-end">
                        {billing === 0 ? (
                          <AlertDialogComponent
                            actionButtonText={'Remove'}
                            variantName={'destructive'}
                            AlertTitle={'Remove organization'}
                            triggerElement={
                              <Button
                                variant="destructive"
                                aria-label="Delete Organization from Community">
                                <DeleteIcon className="h-4 w-4" />
                              </Button>
                            }
                            onClickContinue={() =>
                              onRemoveOrganization(subscription_id ?? '')
                            }>
                            Are you sure you want to delete this organization{' '}
                            {organization?.name} from this community? This
                            action can not be undone.
                          </AlertDialogComponent>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                    <p className={'pt-s txt-sub-content'}>
                      Billing : {billing} %
                    </p>
                  </div>
                </li>
              );
            }
          )}
        </ul>

        <DataTable
          columns={columns}
          data={usersData}
          tableOptions={{
            onSortingChange: onSortingChange,
            onPaginationChange: onPaginationChange,
            manualSorting: true,
            manualPagination: true,
            rowCount: data.serviceUsers?.totalCount,
          }}
          tableState={{
            sorting: mapToSortingTableValue(orderBy, orderMode),
            pagination,
          }}
        />
      </GuardCapacityComponent>
    </>
  );
};

export default ServiceSlug;
