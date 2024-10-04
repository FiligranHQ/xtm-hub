'use client';

import { CreateOrganization } from '@/components/organization/create-organization';
import { DeleteOrganization } from '@/components/organization/delete-organization';
import { EditOrganization } from '@/components/organization/edit-organization';
import { useOrganizationListLocalstorage } from '@/components/organization/organization-list-localstorage';
import { getOrganizations } from '@/components/organization/organization.service';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { IconActions } from '@/components/ui/icon-actions';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import { DataTable, DataTableHeadBarOptions } from 'filigran-ui/clients';
import { Badge } from 'filigran-ui/servers';
import { FunctionComponent, Suspense, useState } from 'react';
import {
  OrderingMode,
  OrganizationsPaginationQuery$variables,
} from '../../../__generated__/OrganizationsPaginationQuery.graphql';
import { organizationItem_fragment$data } from '../../../__generated__/organizationItem_fragment.graphql';
import { OrganizationOrdering } from '../../../__generated__/organizationSelectQuery.graphql';

const OrganizationList: FunctionComponent = () => {
  const columns: ColumnDef<organizationItem_fragment$data>[] = [
    {
      accessorKey: 'name',
      id: 'name',
      header: 'Name',
      cell: ({ row }) => {
        return <>{row.original.name}</>;
      },
    },
    {
      accessorKey: 'domains',
      id: 'domains',
      header: 'Domains',
      cell: ({ row }) => {
        return (
          <div className="flex space-x-s">
            {row.original.domains?.map((domain) => (
              <Badge
                className="truncate"
                key={domain}>
                {domain}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      size: 100,
      enableHiding: false,
      enableSorting: false,
      enableResizing: false,
      cell: ({ row }) => (
        <IconActions
          icon={
            <>
              <MoreVertIcon className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </>
          }>
          <EditOrganization organization={row.original} />
          <DeleteOrganization
            connectionId={organizationData.organizations.__id}
            organization={row.original}
          />
        </IconActions>
      ),
    },
  ];
  const {
    pageSize,
    setPageSize,
    orderMode,
    setOrderMode,
    orderBy,
    setOrderBy,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    resetAll,
  } = useOrganizationListLocalstorage(columns);

  const [organizationData, refetch] = getOrganizations({
    count: pageSize,
    orderMode,
    orderBy,
  });
  const organizationDataTable = organizationData.organizations.edges.map(
    ({ node }) => node
  ) as organizationItem_fragment$data[];

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const handleRefetchData = (
    args?: Partial<OrganizationsPaginationQuery$variables>
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
      transformSortingValueToParams<OrganizationOrdering, OrderingMode>(
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
    <Suspense
      fallback={
        <DataTable
          data={[]}
          columns={columns}
          isLoading={true}
        />
      }>
      <DataTable
        columns={columns}
        data={organizationDataTable}
        toolbar={
          <div className="flex items-center justify-between sm:justify-end gap-s">
            <div className="flex-0 flex-shrink-0">
              <DataTableHeadBarOptions />
            </div>
            <CreateOrganization
              connectionId={organizationData.organizations.__id}
            />
          </div>
        }
        onResetTable={resetAll}
        tableOptions={{
          onSortingChange: onSortingChange,
          onPaginationChange: onPaginationChange,
          manualSorting: true,
          manualPagination: true,
          onColumnOrderChange: setColumnOrder,
          onColumnVisibilityChange: setColumnVisibility,
          rowCount: organizationData.organizations.totalCount,
        }}
        tableState={{
          sorting: mapToSortingTableValue(orderBy, orderMode),
          pagination,
          columnOrder,
          columnVisibility,
          columnPinning: {
            right: ['actions'],
          },
        }}
      />
    </Suspense>
  );
};
export default OrganizationList;
