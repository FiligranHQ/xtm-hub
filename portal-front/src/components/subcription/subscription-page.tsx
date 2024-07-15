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
} from 'filigran-ui/clients';
import { Badge } from 'filigran-ui/servers';

interface SubscriptionListProps {}

const SubscriptionPage: React.FunctionComponent<
  SubscriptionListProps
> = ({}) => {
  const [subscriptions, refetch] = getSubscriptions();
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
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </React.Suspense>
    </>
  );
};
export default SubscriptionPage;
