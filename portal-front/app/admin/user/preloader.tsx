'use client';

import { SerializablePreloadedQuery } from '@/relay/loadSerializableQuery';
import preloaderUserQueryNode, {
  preloaderUserQuery,
} from '../../../__generated__/preloaderUserQuery.graphql';
import * as React from 'react';
import useSerializablePreloadedQuery from '@/hooks/useSerializablePreloadedQuery';
import { graphql } from 'react-relay';
import UserList from '@/components/admin/user/user-list';

// Configuration or Preloader Query
export const PreloaderQuery = graphql`
  query preloaderUserQuery(
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
  preloadedQuery: SerializablePreloadedQuery<
    typeof preloaderUserQueryNode,
    preloaderUserQuery
  >;
}

// Component
const Preloader: React.FunctionComponent<PreloaderProps> = ({
  preloadedQuery,
}) => {
  const queryRef = useSerializablePreloadedQuery(preloadedQuery);
  return <UserList queryRef={queryRef} />;
};

// Component export
export default Preloader;
