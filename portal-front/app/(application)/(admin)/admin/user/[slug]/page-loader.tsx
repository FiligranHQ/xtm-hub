'use client';

import * as React from 'react';
import { graphql, useQueryLoader } from 'react-relay';
import UserSlug from '@/components/admin/user/[slug]/user-slug';
import useMountingLoader from '@/hooks/useMountingLoader';
import { pageLoaderUserSlugQuery } from '../../../../../../__generated__/pageLoaderUserSlugQuery.graphql';

// Configuration or Preloader Query
export const UserSlugQuery = graphql`
    query pageLoaderUserSlugQuery($id: ID!) {
        user(id: $id) {
            ...userSlug_fragment
        }
    }
`;

// Component interface
interface PreloaderProps {
  id: string;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({ id }) => {
  const [queryRef, loadQuery] = useQueryLoader<pageLoaderUserSlugQuery>(UserSlugQuery);
  useMountingLoader(loadQuery, { id });
  return queryRef ? <UserSlug queryRef={queryRef} /> : <div>SPINNER</div>;
};

// Component export
export default PageLoader;
