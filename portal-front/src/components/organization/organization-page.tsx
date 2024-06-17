'use client';

import * as React from 'react';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import OrganizationList from '@/components/organization/organization-list';
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
import { Button } from 'filigran-ui/servers';
import { DeleteIcon, EditIcon } from 'filigran-icon';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { CreateOrganization } from '@/components/organization/create-organization';

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

  const [data, refetch] = useRefetchableFragment<
    organizationSelectQuery,
    organizationList_organizations$key
  >(organizationsFragment, organizationData);

  console.log(data);
  const organizationDataTable = data.organizations.edges.map(
    ({ node }) => node
  ) as organizationItem_fragment$data[];

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
      id: 'actions',
      size: 100,
      enableHiding: false,
      enableSorting: false,
      enableResizing: false,
      cell: ({ row }) => {
        return (
          <AlertDialogComponent
            actionButtonText={'Delete'}
            variantName={'destructive'}
            AlertTitle={'Delete organization'}
            triggerElement={
              <Button
                variant="ghost"
                aria-label="Delete Organization">
                <DeleteIcon className="h-4 w-4" />
              </Button>
            }
            onClickContinue={() => {}}>
            Are you sure you want to delete this organization{' '}
            {row.original.name}? This action can not be undone.
          </AlertDialogComponent>
        );
      },
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
