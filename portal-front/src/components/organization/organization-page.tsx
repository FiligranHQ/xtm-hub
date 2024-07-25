'use client';

import * as React from 'react';
import { useState } from 'react';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { getOrganizations } from '@/components/organization/organization.service';
import { organizationItem_fragment$data } from '../../../__generated__/organizationItem_fragment.graphql';
import { DataTable } from 'filigran-ui/clients';
import { ColumnDef, ColumnSort, PaginationState } from '@tanstack/react-table';
import { CreateOrganization } from '@/components/organization/create-organization';
import { EditOrganization } from '@/components/organization/edit-organization';
import { DeleteOrganization } from '@/components/organization/delete-organization';
import { transformSortingValueToParams } from '@/components/ui/handle-sorting.utils';
import {
  OrderingMode,
  OrganizationsPaginationQuery$variables,
} from '../../../__generated__/OrganizationsPaginationQuery.graphql';
import { OrganizationOrdering } from '../../../__generated__/organizationSelectQuery.graphql';

const breadcrumbValue = [
  {
    href: '/',
    label: 'Home',
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

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: Number(localStorage.getItem('countOrganizationList')),
  });

  const handleRefetchData = (
    args?: Partial<OrganizationsPaginationQuery$variables>
  ) => {
    const sorting = [
      {
        id: localStorage.getItem('orderByOrganizationList'),
        desc: localStorage.getItem('orderModeOrganizationList') === 'desc',
      } as unknown as ColumnSort,
    ];
    refetch({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      orderBy: localStorage.getItem(
        'orderByOrganizationList'
      ) as OrganizationOrdering,
      orderMode: localStorage.getItem(
        'orderModeOrganizationList'
      ) as OrderingMode,
      ...transformSortingValueToParams(sorting),
      ...args,
    });
  };

  const onSortingChange = (updater: unknown) => {
    const sorting = [
      {
        id: localStorage.getItem('orderByOrganizationList'),
        desc: localStorage.getItem('orderModeOrganizationList') === 'desc',
      },
    ];
    const newSortingValue =
      updater instanceof Function ? updater(sorting) : updater;
    localStorage.setItem('orderByOrganizationList', newSortingValue[0].id);
    localStorage.setItem(
      'orderModeOrganizationList',
      newSortingValue[0].desc ? 'desc' : 'asc'
    );

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
  };

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
        tableState={{
          sorting: [
            {
              id: localStorage.getItem('orderByOrganizationList') ?? '',
              desc:
                localStorage.getItem('orderModeOrganizationList') === 'desc',
            },
          ],
          pagination,
        }}
      />
      <CreateOrganization connectionId={organizationData.organizations.__id} />
    </>
  );
};
export default OrganizationPage;
