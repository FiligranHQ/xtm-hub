'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';
import { getOrganizations } from '@/components/organization/organization.service';

interface OrganizationsProps {}

const columns: ColumnDef<{ id: string; name: string }>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: 'Name',
  },
];
const OrganizationList: React.FunctionComponent<OrganizationsProps> = ({}) => {
  const organizationData = getOrganizations();
  const organizationsTab =
    organizationData.map((edge) => ({
      id: edge.node.id ?? '',
      name: edge.node.name ?? '',
    })) ?? [];

  return (
    <>
      <div className="container mx-auto py-10">
        <DataTable
          columns={columns}
          data={organizationsTab}
        />
      </div>
    </>
  );
};
export default OrganizationList;
