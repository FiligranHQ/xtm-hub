'use client';

import * as React from 'react';
import { useState } from 'react';
import { DataTable } from 'filigran-ui/clients';
import { getSubscriptionsByOrganization } from '@/components/subcription/subscription.service';
import { serviceList_fragment$data } from '../../../__generated__/serviceList_fragment.graphql';
import {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { Badge, Button } from 'filigran-ui/servers';
import { transformSortingValueToParams } from '@/components/ui/handle-sorting.utils';
import { OrderingMode } from '../../../__generated__/pageLoaderUserQuery.graphql';
import { SubscriptionOrdering } from '../../../__generated__/subscriptionsByOrganizationSelectQuery.graphql';
import { SubscriptionsPaginationQuery$variables } from '../../../__generated__/SubscriptionsPaginationQuery.graphql';
import Link from 'next/link';
import { CourseOfActionIcon, IndicatorIcon } from 'filigran-icon';
import GuardCapacityComponent from '@/components/admin-guard';

const columns: ColumnDef<serviceList_fragment$data>[] = [
  {
    id: 'service_name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">{row.original.name}</div>
      );
    },
  },
  {
    id: 'service_type',
    size: 30,
    header: 'Type',
    cell: ({ row }) => {
      return <Badge className={'cursor-default'}>{row.original.type}</Badge>;
    },
  },
  {
    accessorKey: 'provider',
    id: 'service_provider',
    size: 30,
    header: 'Provider',
  },
  {
    size: 300,
    accessorKey: 'description',
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
          <GuardCapacityComponent
            capacityRestriction={['FRT_ACCESS_SERVICES']}
            displayError={false}>
            <Button
              asChild
              className="w-3/4">
              <Link
                href={`${row.original.url}`}
                target="_blank"
                rel="noopener noreferrer nofollow">
                {' '}
                <IndicatorIcon className="mr-2 h-5 w-5" />
                View more
              </Link>
            </Button>
          </GuardCapacityComponent>

          <GuardCapacityComponent
            capacityRestriction={['BCK_MANAGE_SERVICES']}
            displayError={false}>
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
const OwnedServices: React.FunctionComponent<{}> = ({}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const DEFAULT_ITEM_BY_PAGE = 50;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_ITEM_BY_PAGE,
  });
  const [subscriptionsOrganization, refetchSubOrga] =
    getSubscriptionsByOrganization();

  const ownedServices =
    subscriptionsOrganization.subscriptionsByOrganization.edges.map(
      (subscription) => subscription.node.service
    ) as serviceList_fragment$data[];

  const handleRefetchData = (
    args?: Partial<SubscriptionsPaginationQuery$variables>
  ) => {
    refetchSubOrga({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      orderBy: 'start_date',
      orderMode: 'asc',
      ...transformSortingValueToParams(sorting),
      ...args,
    });
  };

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
          tableState={{ sorting, pagination }}
        />
      ) : (
        'You do not have any service... Yet !'
      )}
    </>
  );
};

export default OwnedServices;
