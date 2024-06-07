'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';
import { Organization } from '@/components/organization/organization-page';
import { Button } from 'filigran-ui';
import { DeleteIcon } from 'filigran-icon';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { organizationDeletion } from '@/components/organization/organization.graphql';
import { organizationDeletionMutation } from '../../../__generated__/organizationDeletionMutation.graphql';
import { useMutation } from 'react-relay';

interface OrganizationsProps {
  initialOrganizations: Organization[];
}

const OrganizationList: React.FunctionComponent<OrganizationsProps> = ({
  initialOrganizations,
}) => {
  const [organizations, setOrganizations] =
    React.useState<Organization[]>(initialOrganizations);
  const [deleteOrganizationMutation] =
    useMutation<organizationDeletionMutation>(organizationDeletion);
  const deleteOrga = (organizationId: string) => {
    deleteOrganizationMutation({
      variables: { id: organizationId },
      onCompleted: (response: any) => {
        setOrganizations(
          organizations.filter(
            (organization) => organization.id !== response.deleteOrganization.id
          )
        );
      },
    });
  };
  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: 'name',
      id: 'name',
      header: 'Name',
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
            AlertTitle={'Delete organization'}
            triggerElement={
              <Button
                variant="ghost"
                aria-label="Delete Organization">
                <DeleteIcon className="h-4 w-4" />
              </Button>
            }
            onClickContinue={() => deleteOrga(row.original.id)}>
            Are you sure you want to delete this organization{' '}
            {row.original.name}? This action can not be undone.
          </AlertDialogComponent>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={organizations}
      />
    </div>
  );
};
export default OrganizationList;
