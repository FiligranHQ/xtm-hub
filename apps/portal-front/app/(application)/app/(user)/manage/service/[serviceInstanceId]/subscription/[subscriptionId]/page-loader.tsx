'use client';

import { UserServiceFromSubscription } from '@/components/service/user_service.graphql';
import { SubscriptionById } from '@/components/subcription/subscription.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
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
  subscriptionId: string;
  serviceInstance: serviceInstance_fragment$data;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({
  subscriptionId,
  serviceInstance,
}) => {
  const [queryRef, loadQuery] =
    useQueryLoader<userServiceFromSubscriptionQuery>(
      UserServiceFromSubscription
    );
  const [count] = useLocalStorage('countUserServices', 50);
  const [orderMode] = useLocalStorage('orderModeUserServices', 'asc');
  const [orderBy] = useLocalStorage('orderByUserServices', 'first_name');
  useMountingLoader(loadQuery, {
    subscriptionId,
    count,
    orderBy,
    orderMode,
  });

  const [queryRefSubscription, loadQuerySubscription] =
    useQueryLoader<subscriptionByIdQuery>(SubscriptionById);
  useMountingLoader(loadQuerySubscription, {
    subscriptionId,
  });

  return (
    <>
      {queryRef && queryRefSubscription && serviceInstance ? (
        <SubscriptionSlug
          queryRef={queryRef}
          serviceInstance={serviceInstance}
          queryRefSubscription={queryRefSubscription}
          subscriptionId={subscriptionId}
        />
      ) : (
        <Loader />
      )}
    </>
  );
};

// Component export
export default PageLoader;
