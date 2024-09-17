import {
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from 'filigran-ui/clients';
import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { Button } from 'filigran-ui/servers';
import { AddIcon, DeleteIcon } from 'filigran-icon';
import { RESTRICTION } from '@/utils/constant';
import GuardCapacityComponent from '@/components/admin-guard';
import {
  SubscriptionDeleteMutation,
  SubscriptionsByService,
} from '@/components/subcription/subscription.graphql';
import { subscriptionDeleteMutation } from '../../../../__generated__/subscriptionDeleteMutation.graphql';
import {
  subscriptionByServiceQuery,
  subscriptionByServiceQuery$variables,
} from '../../../../__generated__/subscriptionByServiceQuery.graphql';
import { serviceByIdQuery } from '../../../../__generated__/serviceByIdQuery.graphql';
import { ServiceById } from '@/components/service/service.graphql';
import { ServiceSlugFormSheet } from '@/components/service/[slug]/service-slug-form-sheet';
import TriggerButton from '@/components/ui/trigger-button';
import { ServiceSlugAddOrgaFormSheet } from '@/components/service/[slug]/service-slug-add-orga-form-sheet';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import AcceptCommunity from '@/components/service/[slug]/accept-community';
import { subscriptionByService_fragment$data } from '../../../../__generated__/subscriptionByService_fragment.graphql';
import { userService_fragment$data } from '../../../../__generated__/userService_fragment.graphql';
import {
  SubscriptionStatusBadge,
  SubscriptionStatusTypeBadge,
} from '@/components/ui/subscription-status-badge';
import ServiceUserServiceSlug from '@/components/service/[slug]/service-user-service-table';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';

interface ServiceSlugProps {
  queryRef: PreloadedQuery<subscriptionByServiceQuery>;
  queryRefService: PreloadedQuery<serviceByIdQuery>;
  loadQuery: (
    variables: subscriptionByServiceQuery$variables,
    options?: UseQueryLoaderLoadQueryOptions | undefined
  ) => void;
  serviceId: string;
}

const ServiceSlug: FunctionComponent<ServiceSlugProps> = ({
  queryRef,
  queryRefService,
  loadQuery,
  serviceId,
}) => {
  const [openSheet, setOpenSheet] = useState(false);

  const [openSheetAddOrga, setOpenSheetAddOrga] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  const { toast } = useToast();

  const queryData = usePreloadedQuery<subscriptionByServiceQuery>(
    SubscriptionsByService,
    queryRef
  );
  const queryDataService = usePreloadedQuery<serviceByIdQuery>(
    ServiceById,
    queryRefService
  );

  const [commitSubscriptionMutation] = useMutation<subscriptionDeleteMutation>(
    SubscriptionDeleteMutation
  );

  const onRemoveOrganization = (subscription_id: string) => {
    commitSubscriptionMutation({
      variables: {
        subscription_id: subscription_id,
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: <>{'Organization removed'}</>,
        });
        loadQuery({ service_id: serviceId }, { fetchPolicy: 'network-only' });

        setOpenSheet(false);
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

  const breadcrumbValue = [
    {
      label: 'Services',
      href: '/service',
    },
    {
      label: queryDataService.serviceById?.name,
    },
  ];
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <div className="flex items-center gap-s">
        <h2>
          <span className="capitalize">
            {queryDataService.serviceById?.type?.toLowerCase()}
          </span>{' '}
          - {queryDataService.serviceById?.name}
        </h2>
        {queryData.subscriptionsByServiceId && (
          <SubscriptionStatusBadge
            type={
              queryData.subscriptionsByServiceId[0]
                ?.status as SubscriptionStatusTypeBadge
            }
          />
        )}
      </div>

      <div>{queryDataService.serviceById?.description}</div>
      <GuardCapacityComponent
        capacityRestriction={[
          RESTRICTION.CAPABILITY_BYPASS,
          RESTRICTION.CAPABILITY_BCK_MANAGE_SERVICES,
          RESTRICTION.CAPABILITY_BCK_MANAGE_COMMUNITIES,
        ]}>
        {queryData.subscriptionsByServiceId &&
        queryData.subscriptionsByServiceId[0]?.status === 'REQUESTED' ? (
          <AcceptCommunity
            insertedUserServices={() =>
              loadQuery(
                { service_id: serviceId },
                { fetchPolicy: 'network-only' }
              )
            }
            serviceId={serviceId}
            subscription={
              queryData
                .subscriptionsByServiceId?.[0] as subscriptionByService_fragment$data
            }
          />
        ) : (
          <></>
        )}
        {queryDataService.serviceById?.type === 'COMMUNITY' && (
          <div className="flex justify-end gap-m pb-s">
            <ServiceSlugFormSheet
              open={openSheet}
              setOpen={setOpenSheet}
              userService={currentUser}
              connectionId={''}
              refetch={() =>
                loadQuery(
                  { service_id: serviceId },
                  { fetchPolicy: 'network-only' }
                )
              }
              subscriptionId={queryData.subscriptionsByServiceId?.[0]?.id ?? ''}
              trigger={
                <TriggerButton
                  disabled={
                    queryData.subscriptionsByServiceId?.[0]?.status ===
                      'REQUESTED' ?? false
                  }
                  onClick={() => setCurrentUser({})}
                  label="Invite user"
                />
              }
            />
          </div>
        )}

        <Tabs
          defaultValue={
            queryData.subscriptionsByServiceId?.[0]?.user_service?.[0]?.user
              ?.organization.name ?? ''
          }>
          <TabsList className="h-12">
            {queryData.subscriptionsByServiceId?.map((subscription) => {
              return (
                <TabsTrigger
                  key={
                    subscription?.user_service?.[0]?.user?.organization?.name
                  }
                  value={
                    subscription?.user_service?.[0]?.user?.organization.name ??
                    ''
                  }
                  className="h-12 data-[state=active]:bg-white">
                  {subscription?.user_service?.[0]?.user?.organization.name}{' '}
                  (billing: {subscription?.billing} % )
                  {subscription?.billing === 0 ? (
                    <AlertDialogComponent
                      actionButtonText={'Remove'}
                      variantName={'destructive'}
                      AlertTitle={'Remove organization'}
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
                      {subscription?.user_service?.[0]?.user?.organization.name}{' '}
                      from this service ? This action can not be undone.
                    </AlertDialogComponent>
                  ) : (
                    <></>
                  )}
                </TabsTrigger>
              );
            })}
            {queryDataService.serviceById?.type === 'COMMUNITY' && (
              <ServiceSlugAddOrgaFormSheet
                open={openSheetAddOrga}
                setOpen={setOpenSheetAddOrga}
                insertedOrganization={() =>
                  loadQuery(
                    { service_id: serviceId },
                    { fetchPolicy: 'network-only' }
                  )
                }
                connectionId={''}
                serviceId={queryDataService.serviceById?.id ?? ''}
                trigger={
                  <Button
                    variant="ghost"
                    className="h-12"
                    aria-label="Add organization">
                    <AddIcon className="mr-2 h-4 w-4" />
                    Add organization
                  </Button>
                }
              />
            )}
          </TabsList>
          {queryData.subscriptionsByServiceId?.length === 0 && (
            <div className="border bg-white p-xl">
              There is no subscription yet on this service...
            </div>
          )}
          {queryData.subscriptionsByServiceId?.map((subscription) => {
            return (
              <TabsContent
                key={subscription?.user_service?.[0]?.user?.organization.name}
                value={
                  subscription?.user_service?.[0]?.user?.organization.name ?? ''
                }
                className="ml-1 mt-0 bg-white p-xl">
                <ServiceUserServiceSlug
                  subscriptionId={subscription?.id}
                  data={
                    subscription?.user_service as userService_fragment$data[]
                  }
                  setOpenSheet={(open) => setOpenSheet(open)}
                  setCurrentUser={(user) => setCurrentUser(user)}
                  loadQuery={() =>
                    loadQuery(
                      { service_id: serviceId },
                      { fetchPolicy: 'network-only' }
                    )
                  }
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </GuardCapacityComponent>
    </>
  );
};

export default ServiceSlug;
