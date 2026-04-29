'use client';

import { UserServiceFromSubscription } from '@/components/service/user_service.graphql';
import { SubscriptionById } from '@/components/subcription/subscription.graphql';
import { subscriptionByIdQuery } from '@generated/subscriptionByIdQuery.graphql';
import { userServiceFromSubscriptionQuery } from '@generated/userServiceFromSubscriptionQuery.graphql';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import { useLocalStorage } from 'usehooks-ts';
import Loader from '@/components/Loader';
import SubscriptionSlug from '@/components/subcription/[slug]/SubscriptionSlug';
import useMountingLoader from '@/hooks/use-mounting-loader';

// Component interface
interface PreloaderProps {
  id: string;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({ id }) => {
  const [queryRef, loadQuery] =
    useQueryLoader<userServiceFromSubscriptionQuery>(
      UserServiceFromSubscription
    );
  const [count] = useLocalStorage('countUserServices', 50);
  const [orderMode] = useLocalStorage('orderModeUserServices', 'asc');
  const [orderBy] = useLocalStorage('orderByUserServices', 'first_name');
  useMountingLoader(loadQuery, {
    subscriptionId: id,
    count,
    orderBy,
    orderMode,
  });

  const [queryRefSubscription, loadQuerySubscription] =
    useQueryLoader<subscriptionByIdQuery>(SubscriptionById);
  useMountingLoader(loadQuerySubscription, {
    subscriptionId: id,
  });

  return (
    <>
      {queryRef && queryRefSubscription ? (
        <SubscriptionSlug
          queryRef={queryRef}
          queryRefSubscription={queryRefSubscription}
          subscriptionId={id}
        />
      ) : (
        <Loader />
      )}
    </>
  );
};

// Component export
export default PageLoader;
