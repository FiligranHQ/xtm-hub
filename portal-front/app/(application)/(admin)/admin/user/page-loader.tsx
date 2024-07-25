'use client';

import * as React from 'react';
import {useQueryLoader} from 'react-relay';
import UserList from '@/components/admin/user/user-list';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import {UserListQuery} from '@/components/admin/user/user.graphql';
import {userQuery} from '../../../../../__generated__/userQuery.graphql';

// Component interface
interface PreloaderProps {}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = () => {
  let count = Number(localStorage.getItem('countUserList'));
  if (!count) {
    localStorage.setItem('countUserList', '50');
    count = 50;
  }
  let orderMode = localStorage.getItem('orderModeUserList');
  if (!orderMode) {
    localStorage.setItem('orderModeUserList', 'asc');
    orderMode = 'asc';
  }

  let orderBy = localStorage.getItem('orderByUserList');
  if (!orderBy) {
    localStorage.setItem('orderByUserList', 'email');
    orderBy = 'email';
  }

  const [queryRef, loadQuery] = useQueryLoader<userQuery>(UserListQuery);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return queryRef ? <UserList queryRef={queryRef} /> : <Loader />;
};

// Component export
export default PageLoader;
