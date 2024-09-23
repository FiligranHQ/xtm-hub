'use client';

import * as React from 'react';
import { useState } from 'react';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { getOrganizations } from '@/components/organization/organization.service';
import { organizationItem_fragment$data } from '../../../__generated__/organizationItem_fragment.graphql';
import { DataTable } from 'filigran-ui/clients';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { CreateOrganization } from '@/components/organization/create-organization';
import { EditOrganization } from '@/components/organization/edit-organization';
import { DeleteOrganization } from '@/components/organization/delete-organization';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import {
  OrderingMode,
  OrganizationsPaginationQuery$variables,
} from '../../../__generated__/OrganizationsPaginationQuery.graphql';
import { OrganizationOrdering } from '../../../__generated__/organizationSelectQuery.graphql';
import { useLocalStorage } from 'usehooks-ts';
import { Badge } from 'filigran-ui/servers';
import { IconActions } from '@/components/ui/icon-actions';
import { Ellipsis } from 'lucide-react';

const breadcrumbValue = [
  {
    label: 'Backoffice',
  },
  {
    label: 'Organizations',
  },
];

const OrganizationPage: React.FunctionComponent = () => {
  const [organizationData, refetch] = getOrganizations();
  const organizationDataTable = organizationData.organizations.edges.map(
    ({ node }) => node
  ) as organizationItem_fragment$data[];
  const [pageSize, setPageSize] = useLocalStorage('countOrganizationList', 50);
  const [orderMode, setOrderMode] = useLocalStorage<OrderingMode>(
    'orderModeOrganizationList',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage<OrganizationOrdering>(
    'orderByOrganizationList',
    'name'
  );
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
          <div className="space-x-s">
            {row.original.domains?.map((domain) => (
              <Badge key={domain}>{domain}</Badge>
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
              <Ellipsis className="h-4 w-4" />
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

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <div className="flex justify-end pb-s">
        <CreateOrganization
          connectionId={organizationData.organizations.__id}
        />
      </div>
      <DataTable
        columns={columns}
        data={organizationDataTable}
        tableOptions={{
          onSortingChange: onSortingChange,
          onPaginationChange: onPaginationChange,
          manualSorting: true,
          manualPagination: true,
        }}
        tableState={{
          sorting: mapToSortingTableValue(orderBy, orderMode),
          pagination,
          columnPinning: {
            right: ['actions'],
          },
        }}
      />
    </>
  );
};
export default OrganizationPage;