'use client';

import * as React from 'react';
import Context from '@/components/context';
import { graphql, useQueryLoader } from 'react-relay';
import { pageLoaderMeQuery } from '../../__generated__/pageLoaderMeQuery.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';

// Configuration or Preloader Query
export const MeQuery = graphql`
    query pageLoaderMeQuery {
        me {
            ...context_fragment
        }
    }
`;

// Component interface
interface LayoutPreloaderProps {
  children: React.ReactNode;
}

// Component
const PageLoader: React.FunctionComponent<LayoutPreloaderProps> = ({ children }) => {
  const [queryRef, loadQuery] = useQueryLoader<pageLoaderMeQuery>(MeQuery);
  useMountingLoader(loadQuery, {});
  if (queryRef) {
    return <Context queryRef={queryRef}>{children}</Context>;
  }
  return <>{children}</>;
};

// Component export
export default PageLoader;
