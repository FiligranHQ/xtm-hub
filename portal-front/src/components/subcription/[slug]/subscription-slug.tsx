import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import {
  UserServiceDeleteMutation,
  UserServiceFromSubscription,
  userServiceFromSubscriptionFragment,
  userServicesFragment,
} from '@/components/service/user_service.graphql';
import { userServiceFromSubscription$data } from '@generated/userServiceFromSubscription.graphql';
import { userServices_fragment$key } from '@generated/userServices_fragment.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import { Badge, Button, DataTable, DataTableHeadBarOptions } from 'filigran-ui';
import { useTranslations } from 'next-intl';

import { FunctionComponent, useContext, useMemo, useState } from 'react';

import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { IconActions, IconActionsButton } from '@/components/ui/icon-actions';
import { RESTRICTION } from '@/utils/constant';
import { userServiceDeleteMutation } from '@generated/userServiceDeleteMutation.graphql';
import { useMutation } from 'react-relay';

import { PortalContext } from '@/components/me/app-portal-context';
import { ServiceSlugForm } from '@/components/service/[slug]/service-slug-form';
import { SubscriptionByIdWithService } from '@/components/subcription/subscription.graphql';
import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from '@/components/ui/breadcrumb-nav';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import { serviceCapability_fragment$data } from '@generated/serviceCapability_fragment.graphql';
import { subscriptionByIdWithServiceQuery } from '@generated/subscriptionByIdWithServiceQuery.graphql';
import { userServiceFromSubscriptionQuery } from '@generated/userServiceFromSubscriptionQuery.graphql';
import {
  PreloadedQuery,
  readInlineData,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
interface SubscriptionSlugProps {
  queryRef: PreloadedQuery<userServiceFromSubscriptionQuery>;
  queryRefSubscription: PreloadedQuery<subscriptionByIdWithServiceQuery>;
  subscriptionId: string;
}

const SubscriptionSlug: FunctionComponent<SubscriptionSlugProps> = ({
  queryRef,
  queryRefSubscription,
  subscriptionId,
}) => {
  const t = useTranslations();

  const queryData = usePreloadedQuery<userServiceFromSubscriptionQuery>(
    UserServiceFromSubscription,
    queryRef
  );

  const queryDataSubscription =
    usePreloadedQuery<subscriptionByIdWithServiceQuery>(
      SubscriptionByIdWithService,
      queryRefSubscription
    );

  const [userServices] = useRefetchableFragment(
    userServiceFromSubscriptionFragment,
    queryData
  );
  const userData = userServices.userServiceFromSubscription.edges.map(
    ({ node }) =>
      readInlineData<userServices_fragment$key>(userServicesFragment, node)
  );
  const [openSheet, setOpenSheet] = useState(false);

  const { me } = useContext(PortalContext);

  const canManageService = () => {
    return userData.some((userService) => {
      return (
        userService?.user?.id === me?.id &&
        userService?.user_service_capability?.some(
          (user_service_capa) =>
            user_service_capa?.generic_service_capability?.name ===
            GenericCapabilityName.ManageAccess
        )
      );
    });
  };

  const breadcrumbValue: BreadcrumbNavLink[] = [
    { label: 'MenuLinks.Home', href: '/' },
    { label: 'MenuLinks.Settings' },
    { label: 'MenuLinks.Services', href: '/admin/service' },
    {
      label:
        queryDataSubscription.subscriptionByIdWithService?.service_instance
          ?.name,
      href: `/admin/service/${queryDataSubscription.subscriptionByIdWithService?.service_instance?.id}`,
    },
    {
      label:
        queryDataSubscription.subscriptionByIdWithService?.organization?.name,
      original: true,
    },
  ];

  const columns: ColumnDef<userServiceFromSubscription$data>[] = useMemo(() => [
    {
      accessorKey: 'user.first_name',
      id: 'first_name',
      header: 'first NAAAME',
    },
    {
      accessorKey: 'user.last_name',
      id: 'last_name',
      header: 'last NAAAME',
    },
    {
      accessorKey: 'user.email',
      id: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'name',
      id: 'name',
      header: t('Service.Capabilities.CapabilitiesTitle'),
      size: -1,
      enableSorting: false,
      cell: ({ row }) => {
        return row.original?.user_service_capability?.length === 0 ? (
          <Badge className="mb-2 mr-2 mt-2">
            {GenericCapabilityName.Access}
          </Badge>
        ) : (
          row.original?.user_service_capability?.map((user_service_capa) =>
            user_service_capa?.generic_service_capability?.name !==
            GenericCapabilityName.Access ? (
              <Badge
                key={
                  user_service_capa?.generic_service_capability?.id ??
                  user_service_capa?.subscription_capability?.service_capability
                    ?.id
                }
                className="mb-2 mr-2 mt-2 uppercase">
                {user_service_capa?.generic_service_capability?.name ??
                  user_service_capa?.subscription_capability?.service_capability
                    ?.name}
              </Badge>
            ) : (
              <></>
            )
          )
        );
      },
    },
    {
      id: 'actions',
      size: 40,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end">
            {(me?.capabilities?.some(
              (capa) => capa?.name === RESTRICTION.CAPABILITY_BYPASS
            ) ||
              canManageService()) && (
              <IconActions
                icon={
                  <>
                    <MoreVertIcon className="h-4 w-4 text-primary" />
                    <span className="sr-only">{t('Utils.OpenMenu')}</span>
                  </>
                }>
                <IconActionsButton
                  aria-label="Edit user rights"
                  onClick={() => {
                    // setCurrentUser(row.original);
                    setOpenSheet(true);
                  }}>
                  {t('Utils.Update')}
                </IconActionsButton>
                <AlertDialogComponent
                  AlertTitle={t('Service.Management.RemoveAccess')}
                  actionButtonText={t('Service.Management.RemoveAccess')}
                  variantName={'destructive'}
                  triggerElement={
                    <Button
                      variant="ghost"
                      className="w-full justify-start normal-case"
                      aria-label={t('Service.Management.RemoveAccess')}>
                      {t('Utils.Delete')}
                    </Button>
                  }
                  onClickContinue={() =>
                    deleteCurrentUser(row.original.user?.email ?? '')
                  }>
                  {t('Service.Management.AreYouSureRemoveAccess', {
                    firstname: row.original.user?.first_name,
                    lastname: row.original.user?.last_name,
                  })}
                </AlertDialogComponent>
              </IconActions>
            )}
          </div>
        );
      },
    },
  ]);
  const [commitUserServiceDeletingMutation] =
    useMutation<userServiceDeleteMutation>(UserServiceDeleteMutation);

  const deleteCurrentUser = (email: string) => {
    commitUserServiceDeletingMutation({
      variables: {
        connections: [queryData.userServiceFromSubscription?.__id ?? ''],
        input: {
          email,
          subscriptionId,
        },
      },
      onCompleted() {},
    });
  };
  const [pagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  });

  const toolbar = (
    <div className="flex justify-between flex-wrap gap-s pt-s">
      <div className="flex gap-s flex-wrap ml-auto">
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
              label={t('Service.Management.InviteUser.TitleInviteUser')}
            />
          }
          title={t('InviteUserServiceForm.Title')}>
          <ServiceSlugForm
            userService={undefined}
            connectionId={
              queryDataSubscription.subscriptionByIdWithService?.__id ?? ''
            }
            serviceCapabilities={
              queryDataSubscription.subscriptionByIdWithService
                ?.service_instance?.service_definition?.service_capability ??
              ([] as unknown as serviceCapability_fragment$data[])
            }
            serviceName={'dsds'}
            serviceId={queryData.serviceInstanceByIdWithSubscriptions?.id ?? ''}
            subscription={
              queryDataSubscription.subscriptionByIdWithService
                ?.subscription_capability
            }
            organizationId={
              queryDataSubscription.subscriptionByIdWithService.organization.id
            }
            subscriptionId={
              queryDataSubscription.subscriptionByIdWithService.id
            }
          />
        </SheetWithPreventingDialog>
        <DataTableHeadBarOptions />
      </div>
    </div>
  );

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />

      <h1>
        {t('Service.Management.Subscription')}:
        {queryDataSubscription.subscriptionByIdWithService?.organization?.name}
      </h1>
      {/*TODO : What do we do with that ? */}
      {queryDataSubscription.subscriptionByIdWithService
        ?.subscription_capability.length > 0 && (
        <div className="border rounded border-border-light p-l">
          <h2 className="mb-l">{t('InviteUserServiceForm.Capabilities')}: </h2>
          {queryDataSubscription.subscriptionByIdWithService?.service_instance?.service_definition?.service_capability?.map(
            (serviceCapa) => {
              return (
                <div key={serviceCapa.id}>
                  {serviceCapa.name}: {serviceCapa.description}
                </div>
              );
            }
          )}
        </div>
      )}
      <DataTable
        toolbar={toolbar}
        columns={columns}
        data={userData}
        tableState={{
          pagination,
          columnPinning: { right: ['actions'] },
        }}
      />
    </>
  );
};
export default SubscriptionSlug;
