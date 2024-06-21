import { OrderingMode } from '../../../__generated__/organizationSelectQuery.graphql';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import {
  SubscriptionOrdering,
  subscriptionsSelectQuery,
} from '../../../__generated__/subscriptionsSelectQuery.graphql';
import {
  subscriptionFetch,
  subscriptionsFragment,
} from '@/components/subcription/subscription.graphql';
import { subscriptionList_subscriptions$key } from '../../../__generated__/subscriptionList_subscriptions.graphql';

export const getSubscriptions = (
  count: number = 10,
  orderBy: SubscriptionOrdering = 'organization_id',
  orderMode: OrderingMode = 'asc'
) => {
  debugger;
  const subscriptionData = useLazyLoadQuery<subscriptionsSelectQuery>(
    subscriptionFetch,
    {
      count,
      orderBy,
      orderMode,
    }
  );
  return useRefetchableFragment<
    subscriptionsSelectQuery,
    subscriptionList_subscriptions$key
  >(subscriptionsFragment, subscriptionData);
  // return subscriptionData;
};
