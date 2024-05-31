'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
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
  const breadcrumbValue = [
    {
      href: '/',
      label: 'Home',
    },
    {
      label: 'Organizations',
    },
  ];
  const organizationData = GetOrganizations();
  const organizationsTab: OrganizationData[] =
    organizationData.map((edge) => ({
      id: edge.node.id ?? '',
      name: edge.node.name ?? '',
    })) ?? [];

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
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
