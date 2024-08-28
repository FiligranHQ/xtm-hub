'use client';

import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import { ServiceCommunityListQuery } from '@/components/service/service.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import { serviceCommunitiesQuery } from '../../../../../__generated__/serviceCommunitiesQuery.graphql';
import CommunityList from '@/components/service/community/community-list';
import { useLocalStorage } from 'usehooks-ts';
import { Breadcrumb } from 'filigran-ui/servers';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';

// Component interface
interface PageProps {}

const breadcrumbValue = [
  {
    label: 'Backoffice',
  },
  {
    label: 'Communities',
  },
];
// Component
const Page: React.FunctionComponent<PageProps> = () => {
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
      <BreadcrumbNav value={breadcrumbValue} />
      <h2 className="text-title">Communities</h2>
      {queryRef ? <CommunityList queryRef={queryRef} /> : <Loader />}
    </>
  );
};

// Component export
export default Page;
