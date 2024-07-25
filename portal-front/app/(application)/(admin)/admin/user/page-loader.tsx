'use client';

import * as React from 'react';
import {useQueryLoader} from 'react-relay';
import UserList from '@/components/admin/user/user-list';
import useMountingLoader from '@/hooks/useMountingLoader';
import {useSearchParams} from 'next/navigation';
import Loader from '@/components/loader';
import {UserListQuery} from '@/components/admin/user/user.graphql';
import {userQuery} from '../../../../../__generated__/userQuery.graphql';

// Component interface
interface PreloaderProps {}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = () => {
  const searchParams = useSearchParams();
  const count = Number(searchParams.get('count') ?? 50);
  const orderMode = searchParams.get('orderMode') ?? 'asc';
  const orderBy = searchParams.get('orderBy') ?? 'email';
  const [queryRef, loadQuery] = useQueryLoader<userQuery>(UserListQuery);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return queryRef ? <UserList queryRef={queryRef} /> : <Loader />;
};

// Component export
export default PageLoader;
