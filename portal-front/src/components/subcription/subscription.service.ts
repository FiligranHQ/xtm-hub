import { OrderingMode } from '../../../__generated__/organizationSelectQuery.graphql';
import {
  PreloadedQuery,
  useLazyLoadQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
  SubscriptionOrdering,
  subscriptionsSelectQuery,
} from '../../../__generated__/subscriptionsSelectQuery.graphql';
import {
  subscriptionFetch,
  subscriptionsByOrganizationFetch,
  subscriptionsByOrganizationFragment,
  subscriptionsFragment,
} from '@/components/subcription/subscription.graphql';
import { subscriptionsByOrganizationSelectQuery } from '../../../__generated__/subscriptionsByOrganizationSelectQuery.graphql';
import { subscriptionListByOrganization_subscriptions$key } from '../../../__generated__/subscriptionListByOrganization_subscriptions.graphql';
import { subscriptionList_subscriptions$key } from '../../../__generated__/subscriptionList_subscriptions.graphql';

export const getSubscriptions = (
  queryRef: PreloadedQuery<subscriptionsSelectQuery>
) => {
  const subscriptionData = usePreloadedQuery<subscriptionsSelectQuery>(
    subscriptionFetch,

    queryRef
  );
  return useRefetchableFragment<
    subscriptionsSelectQuery,
    subscriptionList_subscriptions$key
  >(subscriptionsFragment, subscriptionData);
};

export const getSubscriptionsByOrganization = (
  count: number = 50,
  orderBy: SubscriptionOrdering = 'start_date',
  orderMode: OrderingMode = 'asc'
) => {
  const subscriptionData =
    useLazyLoadQuery<subscriptionsByOrganizationSelectQuery>(
      subscriptionsByOrganizationFetch,
      {
        count,
        orderBy,
        orderMode,
      }
    );
  return useRefetchableFragment<
    subscriptionsByOrganizationSelectQuery,
    subscriptionListByOrganization_subscriptions$key
  >(subscriptionsByOrganizationFragment, subscriptionData);
};
