import * as React from 'react';
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import { pageLoaderUserQuery } from '../../../../__generated__/pageLoaderUserQuery.graphql';
import { UserListQuery } from '../../../../app/(application)/(admin)/admin/user/page-loader';
import { userList_users$key } from '../../../../__generated__/userList_users.graphql';
import { Button } from 'filigran-ui/servers';
import Link from 'next/link';
import { UserCreateSheet } from '@/components/admin/user/user-create-sheet';
import { ColumnDef } from '@tanstack/react-table';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { DataTable } from '@/components/ui/data-table';
import Pagination from '@/components/ui/pagination';

// Relay
export const usersFragment = graphql`
  fragment userList_users on Query
  @refetchable(queryName: "UsersPaginationQuery") {
    users(
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
    ) {
      totalCount
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

const columns: ColumnDef<UserData>[] = [
  {
    accessorKey: 'first_name',
    id: 'first_name',
    header: 'First name',
  },
  {
    accessorKey: 'last_name',
    id: 'last_name',
    header: 'Last name',
  },
  {
    accessorKey: 'email',
    id: 'email',
    header: 'Email',
    enableSorting: false,
  },
  {
    id: 'actions',
    size: 100,
    enableHiding: false,
    enableSorting: false,
    enableResizing: false,
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

  const DEFAULT_ITEM_BY_PAGE = 10;

  const [data, refetch] = useRefetchableFragment<
    pageLoaderUserQuery,
    userList_users$key
  >(usersFragment, queryData);

  const userData = data.users.edges.map(({ node }) => ({
    ...node,
  })) as UserData[];

  const breadcrumbValue = [
    {
      href: '/',
      label: 'Home',
    },
    {
      label: 'Users',
    },
  ];

  const [page, setPage] = React.useState<number>(0);

  const handlePageChange = (page: number) => {
    setPage(page);
    const cursor = btoa(String(DEFAULT_ITEM_BY_PAGE * page));
    refetch({ count: DEFAULT_ITEM_BY_PAGE, cursor });
  };

  const totalPages = Math.ceil(data.users.totalCount / 10);
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />

      <div className="container mx-auto py-10">
        <DataTable
          columns={columns}
          data={userData}
        />
        <Pagination
          page={page}
          handlePageChange={handlePageChange}
          totalPages={totalPages}
        />
      </div>
      <UserCreateSheet connectionID={data?.users?.__id} />
    </>
  );
};

// Component export
export default UserList;
