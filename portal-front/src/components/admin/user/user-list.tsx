import { graphql, PreloadedQuery, usePaginationFragment, usePreloadedQuery } from 'react-relay';
import { preloaderUserQuery } from '../../../../__generated__/preloaderUserQuery.graphql';
import * as React from 'react';
import { PreloaderQuery } from '../../../../app/admin/user/preloader';
import { userList_users$key } from '../../../../__generated__/userList_users.graphql';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
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
        }
      }
    }
  }
`;

// Component interface
interface ServiceProps {
  queryRef: PreloadedQuery<preloaderUserQuery>;
}

// Component
const UserList: React.FunctionComponent<ServiceProps> = ({ queryRef }) => {
  const queryData = usePreloadedQuery<preloaderUserQuery>(
    PreloaderQuery,
    queryRef
  );

  const { data } = usePaginationFragment<
    preloaderUserQuery,
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
