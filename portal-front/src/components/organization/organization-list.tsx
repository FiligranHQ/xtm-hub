'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';
import { Organization } from '@/components/organization/organization-page';
import { Button } from 'filigran-ui/servers';
import { AddIcon, DeleteIcon, EditIcon } from 'filigran-icon';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { OrganizationSheet } from '@/components/organization/organization-sheet';

interface OrganizationsProps {
  organizations: Organization[];
  onAddedOrganization: (newOrganization: Organization) => void;
  onDeletedOrganization: (deletedOrganization: string) => void;
  onEditedOrganization: (editedOrganization: Organization) => void;
}

const OrganizationList: React.FunctionComponent<OrganizationsProps> = ({
  organizations,
  onAddedOrganization,
  onDeletedOrganization,
  onEditedOrganization,
}) => {
  const editedOrganization = (organization: Organization) => {
    onEditedOrganization(organization);
  };

  const onNewOrganization = (newOrganization: Organization) => {
    onAddedOrganization(newOrganization);
  };
  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: 'name',
      id: 'name',
      header: 'Name',
      cell: ({ row }) => {
        return (
          <>
            <OrganizationSheet
              onAddedOrganization={onNewOrganization}
              onEditedOrganization={editedOrganization}
              currentOrganization={row.original}>
              <Button
                variant="ghost"
                className="left-4 mr-4"
                aria-label="Delete Organization">
                <EditIcon className="h-4 w-4" />
              </Button>
            </OrganizationSheet>
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
            onClickContinue={() => onDeletedOrganization(row.original.id)}>
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
      <OrganizationSheet
        onAddedOrganization={onAddedOrganization}
        onEditedOrganization={editedOrganization}
        currentOrganization={undefined}>
        <Button
          size="icon"
          aria-label="Create Organization"
          className="absolute bottom-4 right-4 z-10 rounded-3xl drop-shadow-xl">
          <AddIcon className="h-4 w-4" />
        </Button>
      </OrganizationSheet>
    </div>
  );
};
export default OrganizationList;
