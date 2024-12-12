import { SubscriptionDeleteMutation } from '@/components/subcription/subscription.graphql';

import GuardCapacityComponent from '@/components/admin-guard';
import { Portal, portalContext } from '@/components/portal-context';
import { ServiceSlugAddOrgaFormSheet } from '@/components/service/[slug]/service-slug-add-orga-form-sheet';
import { ServiceSlugFormSheet } from '@/components/service/[slug]/service-slug-form-sheet';
import ServiceUserServiceSlug from '@/components/service/[slug]/service-user-service-table';
import { ServiceByIdWithSubscriptions } from '@/components/service/service.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import TriggerButton from '@/components/ui/trigger-button';
import useAdminPath from '@/hooks/useAdminPath';
import { RESTRICTION } from '@/utils/constant';
import { DeleteIcon } from 'filigran-icon';
import {
  Combobox,
  DataTableHeadBarOptions,
  useToast,
} from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext, useState } from 'react';
import { PreloadedQuery, useMutation, usePreloadedQuery } from 'react-relay';
import { serviceByIdWithSubscriptionsQuery } from '../../../../__generated__/serviceByIdWithSubscriptionsQuery.graphql';
import { serviceWithSubscriptions_fragment$data } from '../../../../__generated__/serviceWithSubscriptions_fragment.graphql';
import { subscriptionDeleteMutation } from '../../../../__generated__/subscriptionDeleteMutation.graphql';
import { subscriptionWithUserService_fragment$data } from '../../../../__generated__/subscriptionWithUserService_fragment.graphql';
interface ServiceSlugProps {
  queryRef: PreloadedQuery<serviceByIdWithSubscriptionsQuery>;
  serviceId: string;
}

const ServiceSlug: FunctionComponent<ServiceSlugProps> = ({
  queryRef,
  serviceId,
}) => {
  const queryData = usePreloadedQuery<serviceByIdWithSubscriptionsQuery>(
    ServiceByIdWithSubscriptions,
    queryRef
  );

  const [commitSubscriptionMutation] = useMutation<subscriptionDeleteMutation>(
    SubscriptionDeleteMutation
  );

  const [openSheetAddOrga, setOpenSheetAddOrga] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  const [selectedSubscription, setSelectedSubscription] =
    useState<subscriptionWithUserService_fragment$data>(
      queryData.serviceByIdWithSubscriptions
        ?.subscriptions?.[0] as subscriptionWithUserService_fragment$data
    );

  const { me } = useContext<Portal>(portalContext);
  const { toast } = useToast();
  const t = useTranslations();

  const breadcrumbValue = [
    {
      label: t('MenuLinks.Home'),
      href: '/',
    },
    {
      label: queryData.serviceByIdWithSubscriptions?.name,
    },
  ];

  const dataOrganizationsTab = (
    queryData.serviceByIdWithSubscriptions?.subscriptions ?? []
  ).map((subscription) => {
    return {
      value: subscription?.organization?.name ?? '',
      label: subscription?.organization?.name ?? '',
    };
  });

  const onValueChange = (value: string) => {
    const subscription =
      queryData.serviceByIdWithSubscriptions?.subscriptions?.find(
        (subscription) => {
          return subscription?.organization.name === value;
        }
      );
    setSelectedSubscription(
      subscription as subscriptionWithUserService_fragment$data
    );
  };

  const isAllowedInviteUser = () => {
    return (
      queryData?.serviceByIdWithSubscriptions?.subscriptions?.map(
        (subscription) => {
          subscription?.user_service.map((user_service) => {
            user_service?.service_capability?.some(
              (c) => c?.service_capability_name === 'MANAGE_ACCESS'
            ) && user_service?.user?.id === me?.id;
          });
        }
      ) ||
      me?.capabilities?.some((capability) => {
        capability?.name === 'BYPASS';
      })
    );
  };

  const removeOrganization = (
    subscription: subscriptionWithUserService_fragment$data
  ) => {
    commitSubscriptionMutation({
      variables: {
        subscription_id: subscription.id,
      },
      onCompleted: (response) => {
        toast({
          title: t('Utils.Success'),
          description: t('ServiceActions.OrganizationDeleted', {
            name: subscription.organization.name,
          }),
        });
        setSelectedSubscription(
          response.deleteSubscription
            ?.subscriptions?.[0] as subscriptionWithUserService_fragment$data
        );
        setOpenSheet(false);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{error.message}</>,
        });
      },
    });
  };

  const toolbar = (
    <div className="flex justify-between flex-wrap gap-s pt-s">
      <div className="flex gap-s items-center">
        {useAdminPath() && (
          <>
            <Combobox
              key={selectedSubscription?.id}
              className="w-[200px]"
              dataTab={dataOrganizationsTab}
              order={t('OrganizationInServiceAction.SelectOrganization')}
              placeholder={t('OrganizationInServiceAction.SelectOrganization')}
              emptyCommand={t('Utils.NotFound')}
              onValueChange={onValueChange}
              value={selectedSubscription?.organization.name ?? ''}
              onInputChange={() => {}}
            />

            <AlertDialogComponent
              actionButtonText={t('MenuActions.Remove')}
              variantName="destructive"
              AlertTitle={t('OrganizationInServiceAction.RemoveOrganization')}
              triggerElement={
                <Button
                  variant="ghost"
                  aria-label={t(
                    'OrganizationInServiceAction.DeleteOrgFromService'
                  )}>
                  <DeleteIcon className="h-4 w-4" />
                </Button>
              }
              onClickContinue={() => removeOrganization(selectedSubscription)}>
              <div>
                <>{t('OrganizationInServiceAction.ConfirmDelete1')}</>{' '}
                <span className="font-bold">
                  {selectedSubscription?.organization.name}
                </span>{' '}
                <>{t('OrganizationInServiceAction.ConfirmDelete2')}</>{' '}
              </div>
            </AlertDialogComponent>
          </>
        )}
      </div>
      <div className="flex gap-s flex-wrap">
        <DataTableHeadBarOptions />
        <GuardCapacityComponent
          displayError
          capacityRestriction={[
            RESTRICTION.CAPABILITY_BYPASS,
            RESTRICTION.CAPABILITY_BCK_MANAGE_SERVICES,
          ]}>
          <ServiceSlugFormSheet
            open={openSheet}
            setOpen={setOpenSheet}
            userService={currentUser}
            connectionId={queryData.serviceByIdWithSubscriptions?.__id ?? ''}
            subscriptionId={selectedSubscription?.id ?? ''}
            trigger={
              isAllowedInviteUser() && (
                <TriggerButton
                  onClick={() => setCurrentUser({})}
                  label={t('Service.InviteUser')}
                />
              )
            }
          />
        </GuardCapacityComponent>
        {useAdminPath() && (
          <ServiceSlugAddOrgaFormSheet
            open={openSheetAddOrga}
            setOpen={setOpenSheetAddOrga}
            serviceId={serviceId}
            connectionId={queryData.serviceByIdWithSubscriptions?.__id ?? ''}
            trigger={
              <Button
                className="text-nowrap"
                variant="outline"
                aria-label={t('Service.SubscribeOrganization')}>
                {t('Service.SubscribeOrganization')}
              </Button>
            }
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="pb-s">{queryData.serviceByIdWithSubscriptions?.name}</h1>
      <div className="pb-s">
        {queryData.serviceByIdWithSubscriptions?.description}
      </div>

      <GuardCapacityComponent
        displayError
        capacityRestriction={[
          RESTRICTION.CAPABILITY_BYPASS,
          RESTRICTION.CAPABILITY_BCK_MANAGE_SERVICES,
        ]}>
        <ServiceUserServiceSlug
          subscriptionId={selectedSubscription?.id}
          data={
            queryData.serviceByIdWithSubscriptions as serviceWithSubscriptions_fragment$data
          }
          setOpenSheet={setOpenSheet}
          setCurrentUser={setCurrentUser}
          toolbar={toolbar}
        />
      </GuardCapacityComponent>
    </>
  );
};

export default ServiceSlug;
