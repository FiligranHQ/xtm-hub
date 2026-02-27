'use client';
import {
  epicListQuery,
  epicsListFragment,
} from '@/components/epic/epic.graphql';
import { epicsList_epics$key } from '@generated/epicsList_epics.graphql';
import { epicsQuery } from '@generated/epicsQuery.graphql';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import PageLoader from './page-loader';

const Page = () => {
  const queryData = useLazyLoadQuery<epicsQuery>(epicListQuery, {});
  const [data] = useRefetchableFragment<epicsQuery, epicsList_epics$key>(
    epicsListFragment,
    queryData
  );
  return <PageLoader epics={data} />;
};

export default Page;
