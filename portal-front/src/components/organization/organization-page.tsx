'use client';

import * as React from 'react';
import { useState } from 'react';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { getOrganizations } from '@/components/organization/organization.service';
import { organizationItem_fragment$data } from '../../../__generated__/organizationItem_fragment.graphql';
import { DataTable } from 'filigran-ui/clients';
import {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table';
import { CreateOrganization } from '@/components/organization/create-organization';
import { EditOrganization } from '@/components/organization/edit-organization';
import { DeleteOrganization } from '@/components/organization/delete-organization';
import { transformSortingValueToParams } from '@/components/ui/handle-sorting.utils';
import { OrderingMode } from '../../../__generated__/pageLoaderUserQuery.graphql';
import { OrganizationsPaginationQuery$variables } from '../../../__generated__/OrganizationsPaginationQuery.graphql';
import { OrganizationOrdering } from '../../../__generated__/organizationSelectQuery.graphql';

const OrganizationPage: React.FunctionComponent = () => {
  const breadcrumbValue = [
    {
      href: '/',
      label: 'Home',
    },
    {
      label: 'Organizations',
    },
  ];

  const [organizationData, refetch] = getOrganizations();

  const organizationDataTable = organizationData.organizations.edges.map(
    ({ node }) => node
  ) as organizationItem_fragment$data[];
  const [sorting, setSorting] = useState<SortingState>([]);
  const DEFAULT_ITEM_BY_PAGE = 50;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_ITEM_BY_PAGE,
  });
  const columns: ColumnDef<organizationItem_fragment$data>[] = [
    {
      accessorKey: 'name',
      id: 'name',
      header: 'Name',
      cell: ({ row }) => {
        return (
          <>
            <EditOrganization organization={row.original}></EditOrganization>
            {row.original.name}
          </>
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
        <DeleteOrganization
          connectionId={organizationData.organizations.__id}
          organization={row.original}></DeleteOrganization>
      ),
    },
  ];

  const handleRefetchData = (
    args?: Partial<OrganizationsPaginationQuery$variables>
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

  const onSortingChange = (updater: unknown) => {
    const newSortingValue =
      updater instanceof Function ? updater(sorting) : updater;
    handleRefetchData(
      transformSortingValueToParams<OrganizationOrdering, OrderingMode>(
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
      <BreadcrumbNav value={breadcrumbValue} />
      <DataTable
        columns={columns}
        data={organizationDataTable}
        tableOptions={{
          onSortingChange: onSortingChange,
          onPaginationChange: onPaginationChange,
          manualSorting: true,
          manualPagination: true,
        }}
        tableState={{ sorting, pagination }}
      />
      <CreateOrganization connectionId={organizationData.organizations.__id} />
    </>
  );
};
export default OrganizationPage;
