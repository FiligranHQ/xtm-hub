'use client';

import Context from '@/components/me-context';
import { MeQuery } from '@/components/me.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import { meLoaderQuery } from '../../__generated__/meLoaderQuery.graphql';

// Component interface
interface LayoutPreloaderProps {
  children: React.ReactNode;
}

// Component
const PageLoader: React.FunctionComponent<LayoutPreloaderProps> = ({
  children,
}) => {
  const [queryRef, loadQuery] = useQueryLoader<meLoaderQuery>(MeQuery);
  useMountingLoader(loadQuery, {});
  if (queryRef) {
    return <Context queryRef={queryRef}>{children}</Context>;
  }
  return <>{children}</>;
};

// Component export
export default PageLoader;
