'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Portal, portalContext } from '@/components/context';

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
  const { organizations } = React.useContext<Portal>(portalContext);

  const organizationsTab: OrganizationData[] =
    organizations?.organizations?.edges.map((edge) => ({
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
