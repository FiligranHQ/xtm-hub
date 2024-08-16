'use client';

import * as React from 'react';
import { useState } from 'react';
import { DataTable } from 'filigran-ui/clients';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Badge, Button } from 'filigran-ui/servers';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import Link from 'next/link';
import { CourseOfActionIcon, IndicatorIcon } from 'filigran-icon';
import GuardCapacityComponent from '@/components/admin-guard';
import { OrderingMode } from '../../../__generated__/ServiceUserPaginationQuery.graphql';
import { useLocalStorage } from 'usehooks-ts';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
  userServiceOwnedFragment,
  UserServiceOwnedQuery,
} from '@/components/service/user_service.graphql';
import { userServiceOwnedQuery } from '../../../__generated__/userServiceOwnedQuery.graphql';
import {
  userServiceOwnedUser$data,
  userServiceOwnedUser$key,
} from '../../../__generated__/userServiceOwnedUser.graphql';
import { UserServiceOrdering } from '../../../__generated__/serviceUserSlugQuery.graphql';
import { ServiceUserOwnedPaginationQuery$variables } from '../../../__generated__/ServiceUserOwnedPaginationQuery.graphql';
import { userServicesOwned_fragment$data } from '../../../__generated__/userServicesOwned_fragment.graphql';

const columns: ColumnDef<userServicesOwned_fragment$data>[] = [
  {
    id: 'service_name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          {row.original.subscription?.service?.name}
        </div>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return (
        <Badge
          variant={
            row.original.subscription?.status === 'REQUESTED'
              ? 'destructive'
              : 'secondary'
          }>
          {row.original.subscription?.status}
        </Badge>
      );
    },
  },
  {
    id: 'service_type',
    size: 30,
    header: 'Type',
    cell: ({ row }) => {
      return (
        <Badge className={'cursor-default'}>
          {row.original.subscription?.service?.type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'subscription.service.provider',
    id: 'service_provider',
    size: 30,
    header: 'Provider',
  },
  {
    size: 300,
    accessorKey: 'subscription.service.description',
    id: 'service_description',
    header: 'Description',
  },
  {
    id: 'action',
    size: 30,
    enableHiding: false,
    enableSorting: false,
    enableResizing: false,
    cell: ({ row }) => {
      return (
        <>
          {row.original?.subscription?.status === 'ACCEPTED' &&
          row.original.service_capability?.some(
            (service_capability) =>
              service_capability?.service_capability_name === 'ACCESS_SERVICE'
          ) ? (
            <>
              <GuardCapacityComponent
                capacityRestriction={['FRT_ACCESS_SERVICES']}
                displayError={false}>
                <Button
                  asChild
                  className="w-3/4">
                  <Link
                    href={row?.original?.service_url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer nofollow">
                    {' '}
                    <IndicatorIcon className="mr-2 h-5 w-5" />
                    View more
                  </Link>
                </Button>
              </GuardCapacityComponent>

              {row.original.service_capability?.some(
                (service_capability) =>
                  service_capability?.service_capability_name ===
                  'MANAGE_ACCESS'
              ) ? (
                <GuardCapacityComponent
                  capacityRestriction={['BCK_MANAGE_SERVICES']}
                  displayError={false}>
                  <Button
                    asChild
                    className="mt-2 w-3/4">
                    <Link
                      href={`/admin/service/${row.original.subscription.service?.id}`}>
                      <CourseOfActionIcon className="mr-2 h-5 w-5" />
                      Manage
                    </Link>
                  </Button>{' '}
                </GuardCapacityComponent>
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          )}
        </>
      );
    },
  },
];

interface OwnedServicesProps {
  queryRef: PreloadedQuery<userServiceOwnedQuery>;
}

const OwnedServices: React.FunctionComponent<OwnedServicesProps> = ({
  queryRef,
}) => {
  const [pageSize, setPageSize] = useLocalStorage('countOwnedServicesList', 50);
  const [orderMode, setOrderMode] = useLocalStorage<OrderingMode>(
    'orderModeOwnedServices',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage<UserServiceOrdering>(
    'orderByOwnedServices',
    'service_name'
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const queryData = usePreloadedQuery<userServiceOwnedQuery>(
    UserServiceOwnedQuery,
    queryRef
  );

  const [data, refetch] = useRefetchableFragment<
    userServiceOwnedQuery,
    userServiceOwnedUser$key
  >(userServiceOwnedFragment, queryData);

  const ownedServices: userServiceOwnedUser$data[] =
    data.userServiceOwned?.edges.map(
      (userService) => userService.node
    ) as userServiceOwnedUser$data[];

  const handleRefetchData = (
    args?: Partial<ServiceUserOwnedPaginationQuery$variables>
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
  return (
    <>
      {ownedServices.length > 0 ? (
        <DataTable
          data={ownedServices}
          columns={columns}
          tableOptions={{
            onSortingChange: onSortingChange,
            onPaginationChange: onPaginationChange,
            manualSorting: true,
            manualPagination: true,
          }}
          tableState={{
            sorting: mapToSortingTableValue(orderBy, orderMode),
            pagination,
          }}
        />
      ) : (
        'You do not have any service... Yet !'
      )}
    </>
  );
};

export default OwnedServices;
