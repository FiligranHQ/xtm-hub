'use client';

import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';

import { useLocalStorage } from 'usehooks-ts';
import { userServiceOwnedQuery } from '../../__generated__/userServiceOwnedQuery.graphql';
import { UserServiceOwnedQuery } from '@/components/service/user_service.graphql';
import OwnedServices from '@/components/service/home/owned-services';

export const dynamic = 'force-dynamic';

// Component interface
interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  const [count, setCount] = useLocalStorage('countServiceOwned', 50);
  const [orderMode, setOrderMode] = useLocalStorage(
    'orderModeServiceOwned',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage(
    'orderByServiceOwned',
    'service_name'
  );
  const [queryRef, loadQuery] = useQueryLoader<userServiceOwnedQuery>(
    UserServiceOwnedQuery
  );
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return queryRef ? <OwnedServices queryRef={queryRef} /> : <Loader />;
};

// Component export
export default Page;
