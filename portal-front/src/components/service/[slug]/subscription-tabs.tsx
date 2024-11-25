'use client';
import { Portal, portalContext } from '@/components/portal-context';
import { ServiceSlugAddOrgaFormSheet } from '@/components/service/[slug]/service-slug-add-orga-form-sheet';
import { SubscriptionTabContent } from '@/components/service/[slug]/subscription-tab-content';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { RESTRICTION } from '@/utils/constant';
import { DeleteIcon } from 'filigran-icon';
import { Tabs, TabsList, TabsTrigger } from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { FunctionComponent, useContext } from 'react';
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
  const { hasCapability } = useContext<Portal>(portalContext);

  return (
    <Tabs defaultValue={subscriptions?.[0]?.id ?? ''}>
      <TabsList className="justify-start min-12 p-0 h-auto overflow-auto w-full">
        {subscriptions?.map((subscription) => (
          <TabsTrigger
            key={subscription?.id}
            value={subscription.id ?? ''}
            className="h-10">
            {subscription.organization_name} (billing: {subscription?.billing}{' '}
            %)
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
                {subscription.organization_name} from this service? This action
                cannot be undone.
              </AlertDialogComponent>
            )}
          </TabsTrigger>
        ))}
        {hasCapability && hasCapability(RESTRICTION.CAPABILITY_BYPASS) && (
          <ServiceSlugAddOrgaFormSheet
            open={openSheetAddOrga}
            setOpen={setOpenSheetAddOrga}
            insertedOrganization={loadQuery}
            serviceId={serviceId}
            trigger={
              <Button
                className="ml-1 text-nowrap"
                variant="outline"
                aria-label="Add organization">
                Add organization
              </Button>
            }
          />
        )}
      </TabsList>

      {subscriptions?.length === 0 && (
        <div className="border p-xl">
          There is no subscription yet on this service...
        </div>
      )}

      {subscriptions?.map((subscription) => (
        <SubscriptionTabContent
          key={subscription.id}
          subscription={subscription}
          setOpenSheet={setOpenSheet}
          setCurrentUser={setCurrentUser}
          loadQuery={loadQuery}
        />
      ))}
    </Tabs>
  );
};
