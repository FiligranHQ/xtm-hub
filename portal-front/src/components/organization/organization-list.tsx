'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';
import { GetOrganizations } from '@/components/organization/organization.service';

interface OrganizationsProps {}

export interface OrganizationData {
  id: string;
  name?: string | null;
}

const columns: ColumnDef<OrganizationData>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: 'Name',
  },
];
const OrganizationList: React.FunctionComponent<OrganizationsProps> = ({}) => {
  const organizationData = GetOrganizations();
  const organizationsTab: OrganizationData[] =
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
