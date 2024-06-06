'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';
import { Organization } from '@/components/organization/organization-page';
import { Button } from 'filigran-ui';
import { DeleteIcon } from 'filigran-icon';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';

interface OrganizationsProps {
  organizations: Organization[];
}

const OrganizationList: React.FunctionComponent<OrganizationsProps> = ({
  organizations,
}) => {
  const deleteOrga = (organizationId: string) => {
    console.log('DELETE', organizationId);
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
            {row.original.name} ? This action can not be undone.
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
