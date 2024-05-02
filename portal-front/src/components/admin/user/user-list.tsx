import { graphql, PreloadedQuery, usePaginationFragment, usePreloadedQuery } from 'react-relay';
import { pageLoaderUserQuery } from '../../../../__generated__/pageLoaderUserQuery.graphql';
import * as React from 'react';
import { UserListQuery } from '../../../../app/(application)/(admin)/admin/user/page-loader';
import { userList_users$key } from '../../../../__generated__/userList_users.graphql';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { UserCreateSheet } from '@/components/admin/user/user-create-sheet';
import { Button } from 'filigran-ui/servers';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';

// Relay
export const usersFragment = graphql`
  fragment userList_users on Query
  @refetchable(queryName: "UsersPaginationQuery") {
    users(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
    ) @connection(key: "Admin_users") {
      __id # See https://relay.dev/docs/guided-tour/list-data/updating-connections/#using-declarative-directives
      edges {
        node {
          id
          email
          first_name
          last_name
          organization {
            name
          }
        }
      }
    }
  }
`;

// Component interface
interface ServiceProps {
  queryRef: PreloadedQuery<pageLoaderUserQuery>;
}

export interface UserData {
  email?: string;
  first_name?: string | null | undefined;
  id: string;
  last_name?: string | null | undefined;
}

export const columns: ColumnDef<UserData>[] = [
  {
    accessorKey: 'first_name',
    header: 'First name',
  },
  {
    accessorKey: 'last_name',
    header: 'Last name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <Button
          asChild
          variant="ghost">
          <Link href={`/admin/user/${row.original.id}`}>Details</Link>
        </Button>
      );
    },
  },
];
// Component
const UserList: React.FunctionComponent<ServiceProps> = ({ queryRef }) => {
  const queryData = usePreloadedQuery<pageLoaderUserQuery>(
    UserListQuery,
    queryRef
  );

  const { data } = usePaginationFragment<
    pageLoaderUserQuery,
    userList_users$key
  >(usersFragment, queryData);

  const userData = data.users.edges.map(({ node }) => ({
    ...node,
  })) as UserData[];

  return (
    <>
      <Breadcrumb className="pb-2">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="/admin/user">Users</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="container mx-auto py-10">
        <DataTable
          columns={columns}
          data={userData}
        />
      </div>

      <UserCreateSheet connectionID={data?.users?.__id} />
    </>
  );
};

// Component export
export default UserList;
