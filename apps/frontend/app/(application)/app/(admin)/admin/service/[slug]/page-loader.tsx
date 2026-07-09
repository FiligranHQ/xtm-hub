'use client';
import { SubscriptionFilterKey } from '@graphql/generated';

import Loader from '@/components/Loader';
import ServiceSlug from '@/components/service/[slug]/ServiceSlug';

import { ServiceInstanceByIdQuery } from '@/components/service/service.graphql';
import {
  subscriptionFragment,
  subscriptionListFragment,
  SubscriptionListQuery,
} from '@/components/subcription/subscription.graphql';
import useMountingLoader from '@/hooks/use-mounting-loader';
import { serviceInstanceByIdQuery } from '@generated/serviceInstanceByIdQuery.graphql';
import { subscriptionListQuery } from '@generated/subscriptionListQuery.graphql';
import { subscriptionList_fragment$key } from '@generated/subscriptionList_fragment.graphql';
import {
  subscription_fragment$data,
  subscription_fragment$key,
} from '@generated/subscription_fragment.graphql';
import {
  readInlineData,
  useLazyLoadQuery,
  useQueryLoader,
  useRefetchableFragment,
} from 'react-relay';

// Component interface
interface PreloaderProps {
  id: string;
}

// Component
const PageLoader = ({ id }: PreloaderProps) => {
  const [queryRefServiceInstance, loadQuery] =
    useQueryLoader<serviceInstanceByIdQuery>(ServiceInstanceByIdQuery);
  useMountingLoader(loadQuery, { service_instance_id: id });

  const queryDataSubscription = useLazyLoadQuery<subscriptionListQuery>(
    SubscriptionListQuery,
    {
      count: 50,
      orderBy: 'start_date',
      orderMode: 'asc',
      searchTerm: '',
      filters: [
        {
          key: SubscriptionFilterKey.ServiceInstanceId,
          value: [id],
        },
      ],
    }
  );
  const [data] = useRefetchableFragment<
    subscriptionListQuery,
    subscriptionList_fragment$key
  >(subscriptionListFragment, queryDataSubscription);
  const subscriptionsData = data?.subscriptions?.edges.map(({ node }) =>
    readInlineData<subscription_fragment$key>(subscriptionFragment, node)
  ) as subscription_fragment$data[];
  return (
    <>
      {queryRefServiceInstance ? (
        <ServiceSlug
          subscriptions={subscriptionsData}
          queryRefServiceInstance={queryRefServiceInstance}
          subscriptionConnectionId={data?.subscriptions?.__id}
        />
      ) : (
        <Loader />
      )}
    </>
  );
};

// Component export
export default PageLoader;
