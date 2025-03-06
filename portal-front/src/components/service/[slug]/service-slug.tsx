import { SubscriptionDeleteMutation } from '@/components/subcription/subscription.graphql';

import { Portal, portalContext } from '@/components/me/portal-context';
import {
  GenericCapabilityName,
  hasGenericServiceCapa,
} from '@/components/service/[slug]/capabilities/capability.helper';
import { ServiceSlugAddOrgaForm } from '@/components/service/[slug]/service-slug-add-orga-form';
import { ServiceSlugForm } from '@/components/service/[slug]/service-slug-form';
import ServiceUserServiceSlug from '@/components/service/[slug]/service-user-service-table';
import { ServiceByIdWithSubscriptions } from '@/components/service/service.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from '@/components/ui/breadcrumb-nav';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import useAdminByPass from '@/hooks/useAdminByPass';
import useAdminPath from '@/hooks/useAdminPath';
import { serviceByIdWithSubscriptionsQuery } from '@generated/serviceByIdWithSubscriptionsQuery.graphql';
import { serviceCapability_fragment$data } from '@generated/serviceCapability_fragment.graphql';
import { serviceWithSubscriptions_fragment$data } from '@generated/serviceWithSubscriptions_fragment.graphql';
import { subscriptionDeleteMutation } from '@generated/subscriptionDeleteMutation.graphql';
import { subscriptionWithUserService_fragment$data } from '@generated/subscriptionWithUserService_fragment.graphql';
import { userService_fragment$data } from '@generated/userService_fragment.graphql';
import { DeleteIcon } from 'filigran-icon';
import {
  Button,
  Combobox,
  DataTableHeadBarOptions,
  useToast,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext, useState } from 'react';
import { PreloadedQuery, useMutation, usePreloadedQuery } from 'react-relay';
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
  const [currentUser, setCurrentUser] = useState<userService_fragment$data>(
    {} as userService_fragment$data
  );
  const isAdminPath = useAdminPath();

  const [selectedSubscription, setSelectedSubscription] =
    useState<subscriptionWithUserService_fragment$data>(
      queryData.serviceInstanceByIdWithSubscriptions
        ?.subscriptions?.[0] as subscriptionWithUserService_fragment$data
    );

  const { me } = useContext<Portal>(portalContext);
  const { toast } = useToast();
  const t = useTranslations();

  const breadcrumbValue: BreadcrumbNavLink[] = [
    ...(isAdminPath
      ? [
          { label: 'MenuLinks.Settings' },
          { label: 'MenuLinks.Services', href: '/admin/service' },
        ]
      : [{ label: 'MenuLinks.Home', href: '/' }]),
    {
      label: queryData.serviceInstanceByIdWithSubscriptions?.name,
      original: true,
    },
  ];

  const dataOrganizationsTab = (
    queryData.serviceInstanceByIdWithSubscriptions?.subscriptions ?? []
  ).map((subscription) => {
    return {
      value: subscription?.organization?.id ?? '',
      label: subscription?.organization?.name ?? '',
    };
  });

  const onValueChange = (value: string) => {
    const subscription =
      queryData.serviceInstanceByIdWithSubscriptions?.subscriptions?.find(
        (subscription) => {
          return subscription?.organization.id === value;
        }
      );
    setSelectedSubscription(
      subscription as subscriptionWithUserService_fragment$data
    );
  };

  const canManageAccess = hasGenericServiceCapa(
    GenericCapabilityName.ManageAccess,
    queryData,
    me?.id
  );

  const isAllowedInviteUser = canManageAccess || useAdminByPass();

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
          description: <>{t(`Error.Server.${error.message}`)}</>,
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
              value={selectedSubscription?.organization.id ?? ''}
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

        {useAdminPath() && (
          <SheetWithPreventingDialog
            open={openSheetAddOrga}
            setOpen={setOpenSheetAddOrga}
            trigger={
              <Button variant="outline">
                {t('Service.SubscribeOrganization')}
              </Button>
            }
            title={
              t('OrganizationInServiceAction.AddOrganization') +
              ' ' +
              queryData?.serviceInstanceByIdWithSubscriptions?.name
            }>
            <ServiceSlugAddOrgaForm
              subscriptions={
                queryData?.serviceInstanceByIdWithSubscriptions
                  ?.subscriptions as subscriptionWithUserService_fragment$data[]
              }
              capabilities={
                queryData?.serviceInstanceByIdWithSubscriptions
                  ?.service_definition
                  ?.service_capability as unknown as serviceCapability_fragment$data[]
              }
              setSelectedSubscription={setSelectedSubscription}
              serviceId={serviceId}
            />
          </SheetWithPreventingDialog>
        )}

        {dataOrganizationsTab.length > 0 && (
          <SheetWithPreventingDialog
            open={openSheet}
            setOpen={setOpenSheet}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              // Wait for the drawer to open to set focus on the combobox
              setTimeout(() => {
                const input = document.querySelector(
                  'div[role="dialog"][data-state="open"] form input'
                ) as HTMLInputElement | null;
                input?.focus();
              }, 500); // Drawer animation time
            }}
            trigger={
              <TriggerButton
                onClick={() => setCurrentUser({} as userService_fragment$data)}
                label={t('Service.Management.InviteUser.TitleInviteUser')}
              />
            }
            title={t('InviteUserServiceForm.Title')}>
            <ServiceSlugForm
              userService={currentUser}
              connectionId={
                queryData.serviceInstanceByIdWithSubscriptions?.__id ?? ''
              }
              serviceCapabilities={
                queryData?.serviceInstanceByIdWithSubscriptions
                  ?.service_definition
                  ?.service_capability as unknown as serviceCapability_fragment$data[]
              }
              serviceName={
                queryData.serviceInstanceByIdWithSubscriptions?.name ?? ''
              }
              dataOrganizationsTab={dataOrganizationsTab}
              subscription={selectedSubscription}
            />
          </SheetWithPreventingDialog>
        )}
      </div>
    </div>
  );

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      {isAllowedInviteUser ? (
        <>
          <h1 className="pb-s">
            {queryData.serviceInstanceByIdWithSubscriptions?.name}
          </h1>
          <div className="pb-s">
            {queryData.serviceInstanceByIdWithSubscriptions?.description}
          </div>

          <ServiceUserServiceSlug
            subscriptionId={selectedSubscription?.id}
            data={
              queryData.serviceInstanceByIdWithSubscriptions as serviceWithSubscriptions_fragment$data
            }
            setOpenSheet={setOpenSheet}
            setCurrentUser={setCurrentUser}
            toolbar={toolbar}
          />
        </>
      ) : (
        <>
          <h1 className={'txt-title'}>{t('Utils.Error')}</h1>
          {t('Error.YouAreNotAuthorized')}
        </>
      )}
    </>
  );
};

export default ServiceSlug;
