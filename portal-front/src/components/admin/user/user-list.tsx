import { graphql, PreloadedQuery, usePaginationFragment, usePreloadedQuery } from 'react-relay';
import { pageLoaderUserQuery } from '../../../../__generated__/pageLoaderUserQuery.graphql';
import * as React from 'react';
import { UserListQuery } from '../../../../app/(application)/(admin)/admin/user/page-loader';
import { userList_users$key } from '../../../../__generated__/userList_users.graphql';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { buttonVariants } from 'filigran-ui/servers';
import { UserCreateSheet } from '@/components/admin/user/user-create-sheet';

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

      <ul>
        {data.users.edges.map((user) => (
          <li key={user.node?.id}>
            <Link
              className={buttonVariants({ variant: 'outline' })}
              href={`/admin/user/${user.node?.id}`}>
              {user.node?.email}
            </Link>
          </li>
        ))}
      </ul>

      <UserCreateSheet connectionID={data?.users?.__id} />
    </>
  );
};

// Component export
export default UserList;
