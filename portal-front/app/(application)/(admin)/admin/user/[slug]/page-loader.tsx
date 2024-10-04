'use client';

import UserSlug from '@/components/admin/user/[slug]/user-slug';
import { UserSlugQuery } from '@/components/admin/user/user.graphql';
import Loader from '@/components/loader';
import useMountingLoader from '@/hooks/useMountingLoader';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import { userSlugQuery } from '../../../../../../__generated__/userSlugQuery.graphql';

// Component interface
interface PreloaderProps {
  id: string;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({ id }) => {
  const [queryRef, loadQuery] = useQueryLoader<userSlugQuery>(UserSlugQuery);
  useMountingLoader(loadQuery, { id });
  return queryRef ? <UserSlug queryRef={queryRef} /> : <Loader />;
};

// Component export
export default PageLoader;
