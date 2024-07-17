'use client';
import * as React from 'react';
import GuardCapacityComponent from '@/components/admin-guard';
import { RESTRICTION } from '@/utils/constant';
import SubscriptionPage from '@/components/subcription/subscription-page';
import { useQueryLoader } from 'react-relay';
import { subscriptionsSelectQuery } from '../../../../../__generated__/subscriptionsSelectQuery.graphql';
import { subscriptionFetch } from '@/components/subcription/subscription.graphql';
import Loader from '@/components/loader';
import useMountingLoader from '@/hooks/useMountingLoader';
import { useSearchParams } from 'next/navigation';

interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  const searchParams = useSearchParams();
  const count = Number(searchParams.get('count') ?? 50);
  const orderMode = searchParams.get('orderMode') ?? 'desc';
  const orderBy = searchParams.get('orderBy') ?? 'status';
  const [queryRef, loadQuery] =
    useQueryLoader<subscriptionsSelectQuery>(subscriptionFetch);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });

  return (
    <GuardCapacityComponent
      capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>
      {queryRef ? <SubscriptionPage queryRef={queryRef} /> : <Loader />}
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
