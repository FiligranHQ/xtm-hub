'use client';

import Loader from '@/components/loader';
import { UserServiceFromSubscription } from '@/components/service/user_service.graphql';
import SubscriptionSlug from '@/components/subcription/[slug]/subscription-slug';
import { SubscriptionByIdWithService } from '@/components/subcription/subscription.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { subscriptionByIdWithServiceQuery } from '@generated/subscriptionByIdWithServiceQuery.graphql';
import { userServiceFromSubscriptionQuery } from '@generated/userServiceFromSubscriptionQuery.graphql';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import { useLocalStorage } from 'usehooks-ts';

// Component interface
interface PreloaderProps {
  id: string;
  url: string;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({ id, url }) => {
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
    useQueryLoader<subscriptionByIdWithServiceQuery>(
      SubscriptionByIdWithService
    );
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
          service={url}
        />
      ) : (
        <Loader />
      )}
    </>
  );
};

// Component export
export default PageLoader;
