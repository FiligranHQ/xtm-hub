import ServiceUserServiceSlug from '@/components/service/[slug]/service-user-service-table';
import { TabsContent } from 'filigran-ui/clients';
import { FunctionComponent } from 'react';
import { subscriptionByService_fragment$data } from '../../../../__generated__/subscriptionByService_fragment.graphql';
import { userService_fragment$data } from '../../../../__generated__/userService_fragment.graphql';

interface SubscriptionTabContentProps {
  subscription?: subscriptionByService_fragment$data;
  setOpenSheet: (open: boolean) => void;
  setCurrentUser: (user: userService_fragment$data) => void;
  loadQuery: () => void;
}

export const SubscriptionTabContent: FunctionComponent<
  SubscriptionTabContentProps
> = ({ subscription, setOpenSheet, loadQuery, setCurrentUser }) => (
  <TabsContent
    value={
      subscription?.user_service?.[0]?.user?.organizations?.[0]?.name ?? ''
    }
    className="m-0 bg-page-background pt-xl px-xl">
    <ServiceUserServiceSlug
      subscriptionId={subscription?.id}
      data={subscription?.user_service as userService_fragment$data[]}
      setOpenSheet={setOpenSheet}
      setCurrentUser={setCurrentUser}
      loadQuery={loadQuery}
    />
  </TabsContent>
);
