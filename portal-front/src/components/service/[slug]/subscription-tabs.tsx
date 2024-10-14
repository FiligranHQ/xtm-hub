import { ServiceSlugAddOrgaFormSheet } from '@/components/service/[slug]/service-slug-add-orga-form-sheet';
import { SubscriptionTabContent } from '@/components/service/[slug]/subscription-tab-content';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { AddIcon, DeleteIcon } from 'filigran-icon';
import { Tabs, TabsList, TabsTrigger } from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { FunctionComponent } from 'react';
import { subscriptionByService_fragment$data } from '../../../../__generated__/subscriptionByService_fragment.graphql';
import { userService_fragment$data } from '../../../../__generated__/userService_fragment.graphql';

interface SubscriptionTabsProps {
  subscriptions: subscriptionByService_fragment$data[] | undefined;
  serviceType: string | undefined | null;
  serviceId: string;
  onRemoveOrganization: (subscription_id: string) => void;
  openSheet: boolean;
  setOpenSheet: (open: boolean) => void;
  openSheetAddOrga: boolean;
  setOpenSheetAddOrga: (open: boolean) => void;
  setCurrentUser: (user: userService_fragment$data) => void;
  loadQuery: () => void;
}

export const SubscriptionTabs: FunctionComponent<SubscriptionTabsProps> = ({
  subscriptions,
  serviceType,
  serviceId,
  onRemoveOrganization,
  setOpenSheet,
  openSheetAddOrga,
  setOpenSheetAddOrga,
  setCurrentUser,
  loadQuery,
}) => {
  return (
    <Tabs
      defaultValue={
        subscriptions?.[0]?.user_service?.[0]?.user?.organization.name ?? ''
      }>
      <TabsList className="justify-start min-12 p-0 h-auto overflow-auto w-full">
        {subscriptions?.map((subscription) => (
          <TabsTrigger
            key={subscription?.user_service?.[0]?.user?.organization.name}
            value={
              subscription?.user_service?.[0]?.user?.organization.name ?? ''
            }
            className=" data-[state=active]:bg-page-background h-10">
            {subscription?.user_service?.[0]?.user?.organization.name} (billing:{' '}
            {subscription?.billing} %)
            {subscription?.billing === 0 && (
              <AlertDialogComponent
                actionButtonText="Remove"
                variantName="destructive"
                AlertTitle="Remove organization"
                triggerElement={
                  <Button
                    className="ml-2"
                    variant="ghost"
                    aria-label="Delete Organization from the service">
                    <DeleteIcon className="h-4 w-4" />
                  </Button>
                }
                onClickContinue={() =>
                  onRemoveOrganization(subscription?.id ?? '')
                }>
                Are you sure you want to delete this organization{' '}
                {subscription?.user_service?.[0]?.user?.organization.name} from
                this service? This action cannot be undone.
              </AlertDialogComponent>
            )}
          </TabsTrigger>
        ))}
        {serviceType === 'COMMUNITY' && (
          <ServiceSlugAddOrgaFormSheet
            open={openSheetAddOrga}
            setOpen={setOpenSheetAddOrga}
            insertedOrganization={loadQuery}
            connectionId=""
            serviceId={serviceId}
            trigger={
              <Button
                className="text-nowrap"
                variant="ghost"
                aria-label="Add organization">
                <AddIcon className="mr-2 h-4 w-4" />
                Add organization
              </Button>
            }
          />
        )}
      </TabsList>

      {subscriptions?.length === 0 && (
        <div className="border bg-page-background p-xl">
          There is no subscription yet on this service...
        </div>
      )}

      {subscriptions?.map((subscription) => (
        <SubscriptionTabContent
          key={subscription?.user_service?.[0]?.user?.organization.name}
          subscription={subscription}
          setOpenSheet={setOpenSheet}
          setCurrentUser={setCurrentUser}
          loadQuery={loadQuery}
        />
      ))}
    </Tabs>
  );
};
