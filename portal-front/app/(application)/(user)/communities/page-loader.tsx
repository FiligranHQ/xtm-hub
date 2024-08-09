'use client';

import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import { ServiceCommunityListQuery } from '@/components/service/service.graphql';
import { serviceCommunitiesQuery } from '../../../../__generated__/serviceCommunitiesQuery.graphql';
import CommunityList from '@/components/service/community/community-list';
import { useLocalStorage } from 'usehooks-ts';

// Component interface
interface PageProps {}

// Component
const PageLoader: React.FunctionComponent<PageProps> = () => {
  const [count, setCount] = useLocalStorage('countCommunitiesList', 50);
  const [orderMode, setOrderMode] = useLocalStorage(
    'orderModeCommunitiesList',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage(
    'orderByCommunitiesList',
    'name'
  );
  const [queryRef, loadQuery] = useQueryLoader<serviceCommunitiesQuery>(
    ServiceCommunityListQuery
  );
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return (
    <>
      <b>Communities</b>
      {queryRef ? <CommunityList queryRef={queryRef} /> : <Loader />}
    </>
  );
};
// Component export
export default PageLoader;
