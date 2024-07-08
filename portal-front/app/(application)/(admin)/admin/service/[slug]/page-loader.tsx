'use client';

import * as React from 'react';
import {graphql, useQueryLoader} from 'react-relay';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import {pageLoaderUsersServiceSlugQuery} from '../../../../../../__generated__/pageLoaderUsersServiceSlugQuery.graphql';
import ServiceSlug from '@/components/service/[slug]/service-slug';

// Configuration or Preloader Query
export const UsersServiceSlugQuery = graphql`
  query pageLoaderUsersServiceSlugQuery($id: ID!) {
    serviceUsers(id: $id) {
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
          url
        }
      }
    }
  }
`;

// Component interface
interface PreloaderProps {
  id: string;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({ id }) => {
  const [queryRef, loadQuery] = useQueryLoader<pageLoaderUsersServiceSlugQuery>(
    UsersServiceSlugQuery
  );
  useMountingLoader(loadQuery, { id });
  return queryRef ? <ServiceSlug queryRef={queryRef} /> : <Loader />;
};

// Component export
export default PageLoader;
