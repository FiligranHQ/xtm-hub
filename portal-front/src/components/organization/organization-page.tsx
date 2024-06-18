'use client';

import * as React from 'react';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { getOrganizations } from '@/components/organization/organization.service';
import { useRefetchableFragment } from 'react-relay';
import { organizationsFragment } from '@/components/organization/organization.graphql';
import { organizationList_organizations$key } from '../../../__generated__/organizationList_organizations.graphql';
import {
  organizationSelectQuery,
  organizationSelectQuery$data,
} from '../../../__generated__/organizationSelectQuery.graphql';
import { organizationItem_fragment$data } from '../../../__generated__/organizationItem_fragment.graphql';
import { DataTable } from 'filigran-ui/clients';
import { ColumnDef } from '@tanstack/react-table';
import { CreateOrganization } from '@/components/organization/create-organization';
import { EditOrganization } from '@/components/organization/edit-organization';
import { DeleteOrganization } from '@/components/organization/delete-organization';

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

  const organizationData: organizationSelectQuery$data = getOrganizations();

  const [data] = useRefetchableFragment<
    organizationSelectQuery,
    organizationList_organizations$key
  >(organizationsFragment, organizationData);

  const organizationDataTable = data.organizations.edges.map(
    ({ node }) => node
  ) as organizationItem_fragment$data[];

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
          connectionId={data.organizations.__id}
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
      />
      <CreateOrganization connectionId={data.organizations.__id} />
    </>
  );
};
export default OrganizationPage;
