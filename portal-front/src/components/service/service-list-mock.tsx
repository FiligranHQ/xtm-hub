import { DataTable } from '@/components/ui/data-table';
import * as React from 'react';
import { ColumnDef, getSortedRowModel } from '@tanstack/react-table';
import { Badge, Button } from 'filigran-ui/servers';
import Link from 'next/link';

interface ServiceTable {
  id: string;
  name: string;
  type: string;
  provider: string;
  description: string;
  link: string;
}

const columns: ColumnDef<ServiceTable>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'type',
    id: 'type',
    header: 'Type',
    cell: ({ row }) => {
      return <Badge variant="outline">{row.original.type}</Badge>;
    },
  },
  {
    accessorKey: 'provider',
    id: 'provider',
    header: 'Provider',
  },
  {
    accessorKey: 'description',
    id: 'description',
    header: 'Description',
  },
  {
    id: 'actions',
    size: 100,
    enableHiding: false,
    enableSorting: false,
    enableResizing: false,
    cell: ({ row }) => {
      return (
        <Button asChild>
          <Link href={`#${row.original.link}`}>View more</Link>
        </Button>
      );
    },
  },
];

const servicesData: ServiceTable[] = [
  {
    id: 'cti-shape-openfeed',
    name: 'Ctishape Open feed',
    type: 'Feed',
    provider: 'Ctishape',
    description:
      ' An open CTI feed that you can consult throught OpenCTI or API',
    link: 'https://weather.dev.scredplatform.io/',
  },
  {
    id: 'cti-shape-openfeed',
    name: 'Ctishape Cyber weather',
    type: 'Intel',
    provider: 'Ctishape',
    description: ' A ctishape powered weather intel',
    link: 'https://opencti-test2.non-prod.scredplatform.io/dashboard',
  },
];
const ServiceListMock = () => {
  return (
    <DataTable
      columns={columns}
      data={servicesData}
      tableOptions={{
        getSortedRowModel: getSortedRowModel(),
      }}
    />
  );
};

export default ServiceListMock;
