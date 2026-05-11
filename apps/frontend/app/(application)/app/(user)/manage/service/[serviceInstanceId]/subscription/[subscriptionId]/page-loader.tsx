'use client';

import Loader from '@/components/Loader';
import { UserServiceFromSubscription } from '@/components/service/user_service.graphql';
import SubscriptionSlug from '@/components/subcription/[slug]/SubscriptionSlug';
import { SubscriptionById } from '@/components/subcription/subscription.graphql';
import useMountingLoader from '@/hooks/use-mounting-loader';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { subscriptionByIdQuery } from '@generated/subscriptionByIdQuery.graphql';
import { userServiceFromSubscriptionQuery } from '@generated/userServiceFromSubscriptionQuery.graphql';
import { useQueryLoader } from 'react-relay';
import { useLocalStorage } from 'usehooks-ts';

// Component interface
interface PreloaderProps {
  subscriptionId: string;
  serviceInstance: serviceInstance_fragment$data;
}

// Component
const PageLoader = ({ subscriptionId, serviceInstance }: PreloaderProps) => {
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
