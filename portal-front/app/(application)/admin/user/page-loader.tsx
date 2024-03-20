'use client';

import * as React from 'react';
import { graphql, useQueryLoader } from 'react-relay';
import UserList from '@/components/admin/user/user-list';
import useMountingLoader from '@/hooks/useMountingLoader';
import { pageLoaderUserQuery } from '../../../../__generated__/pageLoaderUserQuery.graphql';
import { useSearchParams } from 'next/navigation';

// Configuration or Preloader Query
export const UserListQuery = graphql`
    query pageLoaderUserQuery(
        $count: Int!
        $cursor: ID
        $orderBy: UserOrdering!
        $orderMode: OrderingMode!
    ) {
        ...userList_users
    }
`;

// Component interface
interface PreloaderProps {
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = () => {
  const searchParams = useSearchParams();
  const count = Number(searchParams.get('count') ?? 2);
  const orderMode = searchParams.get('orderMode') ?? 'asc';
  const orderBy = searchParams.get('orderBy') ?? 'email';
  const [queryRef, loadQuery] = useQueryLoader<pageLoaderUserQuery>(UserListQuery);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return queryRef ? <UserList queryRef={queryRef} /> : <div>SPINNER</div>;
};

// Component export
export default PageLoader;
