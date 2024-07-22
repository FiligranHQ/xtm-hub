'use client';

import * as React from 'react';
import { graphql, useQueryLoader } from 'react-relay';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import { pageLoaderUsersServiceSlugQuery } from '../../../../../../__generated__/pageLoaderUsersServiceSlugQuery.graphql';
import ServiceSlug from '@/components/service/[slug]/service-slug';
import { useSearchParams } from 'next/navigation';

export const serviceUsersFragment = graphql`
  fragment pageLoaderserviceUser on Query
  @refetchable(queryName: "ServiceUserPaginationQuery") {
    serviceUsers(
      id: $id
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
          user {
            id
            last_name
            first_name
            email
          }
          service_capability {
            id
            service_capability_name
          }
          subscription {
            id
            organization {
              name
              id
            }
            service {
              name
              id
            }
          }
        }
      }
    }
  }
`;
// Configuration or Preloader Query
export const UsersServiceSlugQuery = graphql`
  query pageLoaderUsersServiceSlugQuery(
    $id: ID!
    $count: Int!
    $cursor: ID
    $orderBy: UserServiceOrdering!
    $orderMode: OrderingMode!
  ) {
    ...pageLoaderserviceUser
  }
`;

// Component interface
interface PreloaderProps {
  id: string;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({ id }) => {
  const searchParams = useSearchParams();
  const count = Number(searchParams.get('count') ?? 50);
  const orderMode = searchParams.get('orderMode') ?? 'asc';
  const orderBy = searchParams.get('orderBy') ?? 'first_name';
  const [queryRef, loadQuery] = useQueryLoader<pageLoaderUsersServiceSlugQuery>(
    UsersServiceSlugQuery
  );
  useMountingLoader(loadQuery, { id, count, orderBy, orderMode });
  return queryRef ? <ServiceSlug queryRef={queryRef} /> : <Loader />;
};

// Component export
export default PageLoader;
