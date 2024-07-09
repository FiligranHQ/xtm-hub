import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import {
  pageLoaderUsersServiceSlugQuery,
  pageLoaderUsersServiceSlugQuery$data,
} from '../../../../__generated__/pageLoaderUsersServiceSlugQuery.graphql';
import { UsersServiceSlugQuery } from '../../../../app/(application)/(admin)/admin/service/[slug]/page-loader';
import { DataTable } from 'filigran-ui/clients';
import * as React from 'react';
import { Badge } from 'filigran-ui/servers';
import { ColumnDef } from '@tanstack/react-table';

interface UserServiceData extends pageLoaderUsersServiceSlugQuery$data {
  id: string;
  service_capability_names: string[];
}

interface ServiceSlugProps {
  queryRef: PreloadedQuery<pageLoaderUsersServiceSlugQuery>;
}

const columns: ColumnDef<UserServiceData>[] = [
  {
    accessorKey: 'user.first_name',
    id: 'user.first_name',
    header: 'First Name',
  },
  {
    accessorKey: 'user.last_name',
    id: 'user.last_name',
    header: 'Last Name',
  },
  {
    accessorKey: 'user.email',
    id: 'user.email',
    header: 'Email',
  },
  {
    accessorKey: 'service_capability_names',
    id: 'service_capability_names',
    header: 'Capabilities',
    cell: ({ row }) => {
      return (
        <>
          {row.original.service_capability_names.map(
            (service_capa_name, index) => (
              <Badge
                key={index}
                className="mb-2 mr-2 mt-2">
                {service_capa_name}
              </Badge>
            )
          )}
        </>
      );
    },
  },
];

const ServiceSlug: React.FunctionComponent<ServiceSlugProps> = ({
  queryRef,
}) => {
  const data = usePreloadedQuery<pageLoaderUsersServiceSlugQuery>(
    UsersServiceSlugQuery,
    queryRef
  );

  const usersData: UserServiceData[] =
    data?.serviceUsers?.map((user) => {
      const capa_names =
        user?.service_capability?.map((cap) => cap?.service_capability_name) ??
        [];
      return {
        ...user,
        service_capability_names: capa_names,
      } as unknown as UserServiceData;
    }) ?? [];

  return (
    <>
      <DataTable
        columns={columns}
        data={usersData}
      />
    </>
  );
};

export default ServiceSlug;
