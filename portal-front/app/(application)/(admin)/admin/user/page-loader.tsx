'use client';

import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import UserList from '@/components/admin/user/user-list';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import { UserListQuery } from '@/components/admin/user/user.graphql';
import { userQuery } from '../../../../../__generated__/userQuery.graphql';
import { useLocalStorage } from 'usehooks-ts';

// Component interface
interface PreloaderProps {}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = () => {
  const [count, setCount] = useLocalStorage('countUserList', 50);
  const [orderMode, setOrderMode] = useLocalStorage('orderModeUserList', 'asc');
  const [orderBy, setOrderBy] = useLocalStorage('orderByUserList', 'email');

  const [queryRef, loadQuery] = useQueryLoader<userQuery>(UserListQuery);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return queryRef ? <UserList queryRef={queryRef} /> : <Loader />;
};

// Component export
export default PageLoader;
