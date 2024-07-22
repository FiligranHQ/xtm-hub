import {
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
  pageLoaderUsersServiceSlugQuery,
  pageLoaderUsersServiceSlugQuery$data,
  pageLoaderUsersServiceSlugQuery$variables,
} from '../../../../__generated__/pageLoaderUsersServiceSlugQuery.graphql';
import {
  serviceUsersFragment,
  UsersServiceSlugQuery,
} from '../../../../app/(application)/(admin)/admin/service/[slug]/page-loader';
import { DataTable } from 'filigran-ui/clients';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { Badge, Button } from 'filigran-ui/servers';
import {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { ServiceSlugFormSheet } from '@/components/service/[slug]/service-slug-form-sheet';
import { AddIcon, ChevronIcon, LittleArrowIcon } from 'filigran-icon';
import { pageLoaderserviceUser$key } from '../../../../__generated__/pageLoaderserviceUser.graphql';
import { OrderingMode } from '../../../../__generated__/pageLoaderUserQuery.graphql';
import { transformSortingValueToParams } from '@/components/ui/handle-sorting.utils';
import { UserServiceOrdering } from '../../../../__generated__/ServiceUserPaginationQuery.graphql';
import { UserServiceDeleteMutation } from '@/components/service/[slug]/user-service/user-service.graphql';
import { userServiceDeleteMutation } from '../../../../__generated__/userServiceDeleteMutation.graphql';

export interface UserServiceData extends pageLoaderUsersServiceSlugQuery$data {
  id: string;
  service_capability: { id: string; service_capability_name: string }[];
}

interface ServiceSlugProps {
  queryRef: PreloadedQuery<pageLoaderUsersServiceSlugQuery>;
}

const ServiceSlug: React.FunctionComponent<ServiceSlugProps> = ({
  queryRef,
}) => {
  const [openSheet, setOpenSheet] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  const columns: ColumnDef<UserServiceData>[] = [
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
            {row.original?.service_capability?.map((service_capa, index) => (
              <Badge
                key={index}
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
              onClick={useCallback(() => {
                setCurrentUser(row.original);
                setOpenSheet(true);
              }, [])}>
              <ChevronIcon className="h-4 w-4"></ChevronIcon>
            </Button>
            <Button
              variant={'ghost'}
              onClick={useCallback(() => {
                deleteCurrentUser(row.original);
              }, [])}>
              <LittleArrowIcon className="h-4 w-4"></LittleArrowIcon>
            </Button>
          </>
        );
      },
    },
  ];

  const [commitUserServiceDeletingMutation] =
    useMutation<userServiceDeleteMutation>(UserServiceDeleteMutation);
  const deleteCurrentUser = (userService: any) => {
    console.log('userService', userService);
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

  const queryData = usePreloadedQuery<pageLoaderUsersServiceSlugQuery>(
    UsersServiceSlugQuery,
    queryRef
  );

  const [data, refetch] = useRefetchableFragment<
    pageLoaderUsersServiceSlugQuery,
    pageLoaderserviceUser$key
  >(serviceUsersFragment, queryData);
  const DEFAULT_ITEM_BY_PAGE = 50;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_ITEM_BY_PAGE,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const subscriptionId: string =
    data?.serviceUsers?.edges[0]?.node?.subscription?.id ?? '';
  const handleRefetchData = (
    args?: Partial<pageLoaderUsersServiceSlugQuery$variables>
  ) => {
    refetch({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      orderBy: 'first_name',
      orderMode: 'asc',
      ...transformSortingValueToParams(sorting),
      ...args,
    });
  };
  const onSortingChange = (updater: unknown) => {
    const newSortingValue =
      updater instanceof Function ? updater(sorting) : updater;
    handleRefetchData(
      transformSortingValueToParams<UserServiceOrdering, OrderingMode>(
        newSortingValue
      )
    );
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

  return (
    <>
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
        tableState={{ sorting, pagination }}
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
            cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
            orderBy: 'first_name',
            orderMode: 'asc',
          })
        }
        trigger={
          <Button
            onClick={() => (setCurrentUser({}), [])}
            size="icon"
            className="absolute bottom-4 right-4 z-10 rounded-3xl drop-shadow-xl">
            <AddIcon className="h-4 w-4" />
          </Button>
        }></ServiceSlugFormSheet>
    </>
  );
};

export default ServiceSlug;
