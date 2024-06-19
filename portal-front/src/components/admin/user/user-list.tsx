import * as React from 'react';
import {useState} from 'react';
import {graphql, PreloadedQuery, usePreloadedQuery, useRefetchableFragment,} from 'react-relay';
import {
  OrderingMode,
  pageLoaderUserQuery,
  pageLoaderUserQuery$variables,
  UserOrdering,
} from '../../../../__generated__/pageLoaderUserQuery.graphql';
import {UserListQuery} from '../../../../app/(application)/(admin)/admin/user/page-loader';
import {userList_users$key} from '../../../../__generated__/userList_users.graphql';
import {Button} from 'filigran-ui/servers';
import Link from 'next/link';
import {ColumnDef, PaginationState, SortingState,} from '@tanstack/react-table';
import {BreadcrumbNav} from '@/components/ui/breadcrumb-nav';
import {DataTable} from 'filigran-ui/clients';
import {transformSortingValueToParams} from '@/components/ui/handle-sorting.utils';
import {CreateUser} from '@/components/admin/user/user-create';

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
      __id
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

const breadcrumbValue = [
  {
    href: '/',
    label: 'Home',
  },
  {
    label: 'Users',
  },
];

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

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_ITEM_BY_PAGE,
  });

  const [data, refetch] = useRefetchableFragment<
    pageLoaderUserQuery,
    userList_users$key
  >(usersFragment, queryData);

  const userData = data.users.edges.map(({ node }) => ({
    ...node,
  })) as UserData[];

  const [sorting, setSorting] = useState<SortingState>([]);

  const handleRefetchData = (args?: Partial<pageLoaderUserQuery$variables>) => {
    refetch({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      orderBy: 'email',
      orderMode: 'asc',
      ...transformSortingValueToParams(sorting),
      ...args,
    });
  };
  const onSortingChange = (updater: unknown) => {
    const newSortingValue =
      updater instanceof Function ? updater(sorting) : updater;
    handleRefetchData(
      transformSortingValueToParams<UserOrdering, OrderingMode>(newSortingValue)
    );
    setSorting(updater as SortingState);
  };

  const onPaginationChange = (updater: unknown) => {
    const newPaginationValue: PaginationState =
      updater instanceof Function ? updater(pagination) : updater;
    handleRefetchData({
      count: newPaginationValue.pageSize,
      cursor: btoa(
        String(newPaginationValue.pageSize * newPaginationValue.pageIndex)
      ),
    });
    setPagination(newPaginationValue);
  };

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />

      <div className="container mx-auto py-10">
        <DataTable
          columns={columns}
          data={userData}
          tableOptions={{
            onSortingChange: onSortingChange,
            onPaginationChange: onPaginationChange,
            manualSorting: true,
            manualPagination: true,
            rowCount: data.users.totalCount,
          }}
          tableState={{ sorting, pagination }}
        />
      </div>
      <CreateUser connectionId={data?.users?.__id}></CreateUser>
    </>
  );
};

// Component export
export default UserList;
