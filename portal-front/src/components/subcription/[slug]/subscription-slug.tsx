import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import {
  UserServiceDeleteMutation,
  UserServiceFromSubscription,
  userServiceFromSubscriptionFragment,
  userServicesFragment,
} from '@/components/service/user_service.graphql';
import { userServiceFromSubscription$key } from '@generated/userServiceFromSubscription.graphql';
import {
  userServices_fragment$data,
  userServices_fragment$key,
} from '@generated/userServices_fragment.graphql';
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
import { AddUserServiceForm } from '@/components/service/[slug]/add-userservice-form';
import { ServiceById } from '@/components/service/service.graphql';
import { SubscriptionById } from '@/components/subcription/subscription.graphql';
import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from '@/components/ui/breadcrumb-nav';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import { serviceByIdQuery } from '@generated/serviceByIdQuery.graphql';
import { serviceCapability_fragment$data } from '@generated/serviceCapability_fragment.graphql';
import { subscriptionByIdQuery } from '@generated/subscriptionByIdQuery.graphql';
import { subscriptionWithUserService_fragment$data } from '@generated/subscriptionWithUserService_fragment.graphql';
import { userServiceFromSubscriptionQuery } from '@generated/userServiceFromSubscriptionQuery.graphql';
import {
  PreloadedQuery,
  readInlineData,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
interface SubscriptionSlugProps {
  queryRef: PreloadedQuery<userServiceFromSubscriptionQuery>;
  queryRefSubscription: PreloadedQuery<subscriptionByIdQuery>;
  queryRefService?: PreloadedQuery<serviceByIdQuery>;
  subscriptionId: string;
}

const SubscriptionSlug: FunctionComponent<SubscriptionSlugProps> = ({
  queryRef,
  queryRefSubscription,
  queryRefService,
  subscriptionId,
}) => {
  const t = useTranslations();
  const [currentUser, setCurrentUser] = useState<
    userServices_fragment$data | undefined
  >({} as userServices_fragment$data);
  const queryData = usePreloadedQuery<userServiceFromSubscriptionQuery>(
    UserServiceFromSubscription,
    queryRef
  );

  const queryDataSubscription = usePreloadedQuery<subscriptionByIdQuery>(
    SubscriptionById,
    queryRefSubscription
  );
  let breadcrumbValue: BreadcrumbNavLink[] = [];
  if (queryRefService) {
    const queryDataService = usePreloadedQuery<serviceByIdQuery>(
      ServiceById,
      queryRefService
    );
    if (queryDataService && queryDataService.serviceInstanceById) {
      breadcrumbValue = [
        { label: 'MenuLinks.Home', href: '/' },
        {
          label: `${queryDataService.serviceInstanceById.name}`,
          original: true,
          href: `/service/${queryDataService.serviceInstanceById.service_definition!.identifier}/${queryDataService.serviceInstanceById.id}`,
        },
        {
          label: t('Service.Management.ManageUsers'),
        },
      ];
    }
  } else {
    breadcrumbValue = [
      { label: 'MenuLinks.Home', href: '/' },
      { label: 'MenuLinks.Settings' },
      { label: 'MenuLinks.Services', href: '/admin/service' },
      {
        label: queryDataSubscription.subscriptionById?.service_instance?.name,
        href: `/admin/service/${queryDataSubscription.subscriptionById?.service_instance?.id}`,
        original: true,
      },
      {
        label: queryDataSubscription.subscriptionById?.organization?.name,
        original: true,
      },
    ];
  }

  const [userServices] = useRefetchableFragment<
    userServiceFromSubscriptionQuery,
    userServiceFromSubscription$key
  >(userServiceFromSubscriptionFragment, queryData);

  const userData: userServices_fragment$data[] = (
    userServices.userServiceFromSubscription?.edges ?? []
  )
    .map(({ node }) =>
      readInlineData<userServices_fragment$key>(userServicesFragment, node)
    )
    .filter((data) => !!data);

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
  const columns: ColumnDef<userServices_fragment$data>[] = useMemo(
    () => [
      {
        accessorKey: 'user.first_name',
        id: 'first_name',
        header: 'First name',
      },
      {
        accessorKey: 'user.last_name',
        id: 'last_name',
        header: 'Last name',
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
            row.original?.user_service_capability?.map(
              (user_service_capa, index) =>
                user_service_capa?.generic_service_capability?.name !==
                GenericCapabilityName.Access ? (
                  <Badge
                    key={
                      user_service_capa?.generic_service_capability?.name ??
                      user_service_capa?.subscription_capability
                        ?.service_capability?.id ??
                      `fallback-${index}`
                    }
                    className="mb-2 mr-2 mt-2 uppercase">
                    {user_service_capa?.generic_service_capability?.name ??
                      user_service_capa?.subscription_capability
                        ?.service_capability?.name}
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
                      setCurrentUser(row.original);
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
    ],
    []
  );
  const [commitUserServiceDeletingMutation] =
    useMutation<userServiceDeleteMutation>(UserServiceDeleteMutation);

  const deleteCurrentUser = (email: string) => {
    commitUserServiceDeletingMutation({
      variables: {
        connections: [userServices.userServiceFromSubscription?.__id ?? ''],
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
              onClick={() => setCurrentUser(undefined)}
            />
          }
          title={t('InviteUserServiceForm.Title', {
            serviceName:
              queryDataSubscription.subscriptionById?.service_instance?.name,
          })}>
          <AddUserServiceForm
            userService={currentUser}
            connectionId={userServices.userServiceFromSubscription?.__id ?? ''}
            serviceCapabilities={
              (queryDataSubscription.subscriptionById?.service_instance
                ?.service_definition?.service_capability ??
                []) as serviceCapability_fragment$data[]
            }
            serviceName={
              queryDataSubscription.subscriptionById?.service_instance?.name ??
              ''
            }
            serviceId={
              queryDataSubscription.subscriptionById?.service_instance?.id ?? ''
            }
            subscription={
              (queryDataSubscription.subscriptionById ??
                {}) as subscriptionWithUserService_fragment$data
            }
            organizationId={
              queryDataSubscription.subscriptionById?.organization?.id ?? ''
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
        {t('Service.Management.ManageUsersForOrganization', {
          organizationName:
            queryDataSubscription.subscriptionById?.organization?.name,
        })}
      </h1>
      {queryDataSubscription.subscriptionById!.subscription_capability!.length >
        0 && (
        <div className="inline-block border rounded border-primary p-l txt-sub-content">
          <div className="txt-container-title">
            {t('InviteUserServiceForm.Capabilities')}:{' '}
          </div>
          <div className="italic mb-s">
            {t('InviteUserServiceForm.CapabilitiesDescription', {
              organizationName:
                queryDataSubscription.subscriptionById?.organization.name,
              serviceName:
                queryDataSubscription.subscriptionById?.service_instance?.name,
            })}
          </div>
          {queryDataSubscription.subscriptionById?.subscription_capability?.map(
            (subscriptionCapa) => {
              return (
                <div key={subscriptionCapa?.id}>
                  {subscriptionCapa?.service_capability?.name}:{' '}
                  {subscriptionCapa?.service_capability?.description}
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
