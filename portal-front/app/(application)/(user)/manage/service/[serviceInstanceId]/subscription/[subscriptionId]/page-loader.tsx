'use client';

import Loader from '@/components/loader';
import { ServiceById } from '@/components/service/service.graphql';
import { UserServiceFromSubscription } from '@/components/service/user_service.graphql';
import SubscriptionSlug from '@/components/subcription/[slug]/subscription-slug';
import { SubscriptionById } from '@/components/subcription/subscription.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { serviceByIdQuery } from '@generated/serviceByIdQuery.graphql';
import { subscriptionByIdQuery } from '@generated/subscriptionByIdQuery.graphql';
import { userServiceFromSubscriptionQuery } from '@generated/userServiceFromSubscriptionQuery.graphql';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import { useLocalStorage } from 'usehooks-ts';

// Component interface
interface PreloaderProps {
  subscriptionId: string;
  serviceInstanceId: string;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({
  subscriptionId,
  serviceInstanceId,
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

  const [queryRefService, loadQueryService] =
    useQueryLoader<serviceByIdQuery>(ServiceById);
  useMountingLoader(loadQueryService, {
    service_instance_id: serviceInstanceId,
  });
  return (
    <>
      {queryRef && queryRefSubscription && queryRefService ? (
        <SubscriptionSlug
          queryRef={queryRef}
          queryRefService={queryRefService}
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
