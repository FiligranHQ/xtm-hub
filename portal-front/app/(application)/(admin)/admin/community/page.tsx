'use client';

import * as React from 'react';
import {useQueryLoader} from 'react-relay';
import {ServiceCommunityListQuery} from '@/components/service/service.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import {serviceCommunitiesQuery} from '../../../../../__generated__/serviceCommunitiesQuery.graphql';
import CommunityList from '@/components/service/community/community-list';

// Component interface
interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  let count = Number(localStorage.getItem('countCommunitiesList'));
  if (!count) {
    localStorage.setItem('countCommunitiesList', '50');
    count = 50;
  }
  let orderMode = localStorage.getItem('orderModeCommunitiesList');
  if (!orderMode) {
    localStorage.setItem('orderModeCommunitiesList', 'asc');
    orderMode = 'asc';
  }

  let orderBy = localStorage.getItem('orderByCommunitiesList');
  if (!orderBy) {
    localStorage.setItem('orderByCommunitiesList', 'name');
    orderBy = 'name';
  }
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
export default Page;
