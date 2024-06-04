'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';

interface OrganizationsProps {
  organizations: {
    id: string;
    name: string;
  }[];
}

const columns: ColumnDef<{ id: string; name: string }>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: 'Name',
  },
];
const OrganizationList: React.FunctionComponent<OrganizationsProps> = ({
  organizations,
}) => {
  return (
    <>
      <div className="container mx-auto py-10">
        <DataTable
          columns={columns}
          data={organizations}
        />
      </div>
    </>
  );
};
export default OrganizationList;
