'use client';

import * as React from 'react';
import { useState } from 'react';
import { getSubscriptions } from '@/components/subcription/subscription.service';
import { subscriptionItem_fragment$data } from '../../../__generated__/subscriptionItem_fragment.graphql';
import Loader from '@/components/loader';
import { FormatDate } from '@/utils/date';
import SubscriptionList from '@/components/subcription/subcription-list';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { useToast } from 'filigran-ui/clients';
import { PreloadedQuery, useMutation } from 'react-relay';
import { SubscriptionEditMutation } from '@/components/subcription/subscription.graphql';
import { subscriptionEditMutation } from '../../../__generated__/subscriptionEditMutation.graphql';
import { subscriptionsSelectQuery } from '../../../__generated__/subscriptionsSelectQuery.graphql';

interface SubscriptionListProps {
  queryRef: PreloadedQuery<subscriptionsSelectQuery>;
}

const SubscriptionPage: React.FunctionComponent<SubscriptionListProps> = ({
  queryRef,
}) => {
  const [subscriptions, refetch] = getSubscriptions(queryRef);

  const [sorting, setSorting] = useState<SortingState>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  let subscriptionData = subscriptions.subscriptions.edges.map(({ node }) => ({
    ...node,
  })) as subscriptionItem_fragment$data[];

  subscriptionData = subscriptionData.map((data) => {
    return {
      ...data,
      start_date: FormatDate(data.start_date, false),
      end_date: FormatDate(data.end_date, false),
    };
  });

  const [commitSubscriptionMutation] = useMutation<subscriptionEditMutation>(
    SubscriptionEditMutation
  );
  const { toast } = useToast();

  const editSubscription = (
    status: string,
    subscription: subscriptionItem_fragment$data
  ) => {
    commitSubscriptionMutation({
      variables: {
        input: {
          id: subscription.id,
          organization_id: subscription?.organization?.id ?? '',
          service_id: subscription?.service?.id ?? '',
          status: status,
        },
        id: subscription.id,
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: <>{'Subscription accepted'}</>,
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });
  };

  return (
    <>
      <React.Suspense fallback={<Loader />}>
        <SubscriptionList
          key="subscriptions"
          totalCount={subscriptions.subscriptions.totalCount}
          data={subscriptionData}
          refetch={(data) => {
            refetch(data);
          }}
          sorting={sorting}
          setSorting={setSorting}
          pagination={pagination}
          setPagination={setPagination}
          editSubscription={(status, subscription) => {
            editSubscription(status, subscription);
          }}
        />
      </React.Suspense>
    </>
  );
};
export default SubscriptionPage;
