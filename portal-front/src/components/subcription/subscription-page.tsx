'use client';

import * as React from 'react';
import { useState } from 'react';
import { getSubscriptions } from '@/components/subcription/subscription.service';
import { subscriptionItem_fragment$data } from '../../../__generated__/subscriptionItem_fragment.graphql';
import Loader from '@/components/loader';
import { FormatDate } from '@/utils/date';
import SubscriptionList from '@/components/subcription/subcription-list';
import { PaginationState, SortingState } from '@tanstack/react-table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  useToast,
} from 'filigran-ui/clients';
import { Badge } from 'filigran-ui/servers';
import { useMutation } from 'react-relay';
import { SubscriptionEditMutation } from '@/components/subcription/subscription.graphql';
import { subscriptionEditMutation } from '../../../__generated__/subscriptionEditMutation.graphql';

interface SubscriptionListProps {}

const SubscriptionPage: React.FunctionComponent<
  SubscriptionListProps
> = ({}) => {
  const [subscriptions, refetch] = getSubscriptions(
    50,
    'start_date',
    'asc',
    'ACCEPTED'
  );
  const [subscriptionsRequests, refetchSubRequests] = getSubscriptions(
    50,
    'start_date',
    'asc',
    'REQUESTED'
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [sortingSubRequest, setSortingSubRequest] = useState<SortingState>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [paginationSubRequest, setPaginationSubRequest] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize: 50,
    });

  let subscriptionData = subscriptions.subscriptions.edges.map(({ node }) => ({
    ...node,
  })) as subscriptionItem_fragment$data[];
  let subscriptionsRequestsData = subscriptionsRequests.subscriptions.edges.map(
    ({ node }) => ({
      ...node,
    })
  ) as subscriptionItem_fragment$data[];

  subscriptionData = subscriptionData.map((data) => {
    return {
      ...data,
      start_date: FormatDate(data.start_date, false),
      end_date: FormatDate(data.end_date, false),
    };
  });
  subscriptionsRequestsData = subscriptionsRequestsData.map((data) => {
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
      onCompleted: (subscriptionReturned) => {
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
        <Accordion
          type="multiple"
          className="w-full">
          <AccordionItem value="subscriptionsList">
            <AccordionTrigger>Subscriptions List</AccordionTrigger>
            <AccordionContent>
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
                displayActionColumn={false}
                editSubscription={() => {}}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="subscriptionsRequests">
            <AccordionTrigger>
              <div>
                Subscriptions Requests
                <Badge className="ml-2">
                  {subscriptionsRequests.subscriptions.totalCount}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <SubscriptionList
                key="subRequests"
                totalCount={subscriptionsRequests.subscriptions.totalCount}
                data={subscriptionsRequestsData}
                refetch={(data) => {
                  refetchSubRequests(data);
                }}
                sorting={sortingSubRequest}
                setSorting={setSortingSubRequest}
                pagination={paginationSubRequest}
                setPagination={setPaginationSubRequest}
                displayActionColumn={true}
                editSubscription={(status, subscription) => {
                  editSubscription(status, subscription);
                }}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </React.Suspense>
    </>
  );
};
export default SubscriptionPage;
