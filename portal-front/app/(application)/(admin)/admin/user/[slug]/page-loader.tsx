'use client';

import * as React from 'react';
import { graphql, useQueryLoader } from 'react-relay';
import UserSlug from '@/components/admin/user/[slug]/user-slug';
import useMountingLoader from '@/hooks/useMountingLoader';
import { pageLoaderUserSlugQuery } from '../../../../../../__generated__/pageLoaderUserSlugQuery.graphql';
import Loader from '@/components/loader';

// Configuration or Preloader Query
export const UserSlugQuery = graphql`
  query pageLoaderUserSlugQuery($id: ID!) {
    user(id: $id) {
      ...userSlug_fragment
      tracking_data {
        ...dataTracking_fragment
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
  const [queryRef, loadQuery] =
    useQueryLoader<pageLoaderUserSlugQuery>(UserSlugQuery);
  useMountingLoader(loadQuery, { id });
  return queryRef ? <UserSlug queryRef={queryRef} /> : <Loader />;
};

// Component export
export default PageLoader;
