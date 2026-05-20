import {
  UserServiceFromSubscription,
  userServiceFromSubscriptionFragment,
  userServicesFragment,
} from '@/components/service/user_service.graphql';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/BadgeOverflowCounter';
import { DeleteIcon, MoreVertIcon } from '@filigran/icon';
import {
  Badge,
  Button,
  DataTable,
  DataTableHeadBarOptions,
  SelectionState,
} from '@filigran/ui';
import { userServiceFromSubscription$key } from '@generated/userServiceFromSubscription.graphql';
import {
  userServices_fragment$data,
  userServices_fragment$key,
} from '@generated/userServices_fragment.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DeleteUserService } from '@/components/subcription/[slug]/DeleteUserService';
import {
  IconActionContext,
  IconActions,
  IconActionsItem,
} from '@/components/ui/IconActions';
import {
  PreloadedQuery,
  readInlineData,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

import { PortalContext } from '@/components/me/AppPortalContext';
import ServiceSlugHeader from '@/components/service/[slug]/ServiceSlugHeader';
import { UserServiceForm } from '@/components/service/[slug]/UserServiceForm';
import { EditUserService } from '@/components/subcription/[slug]/EditUserService';
import { SubscriptionById } from '@/components/subcription/subscription.graphql';
import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from '@/components/ui/BreadcrumbNav';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { APP_PATH } from '@/utils/path/constant';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import { ServiceRestrictionEnum } from '@generated/models/ServiceRestriction.enum';
import { serviceInstanceForSubscriptions_fragment$data } from '@generated/serviceInstanceForSubscriptions_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { subscriptionByIdQuery } from '@generated/subscriptionByIdQuery.graphql';
import { userServiceFromSubscriptionQuery } from '@generated/userServiceFromSubscriptionQuery.graphql';

interface SubscriptionSlugProps {
  queryRef: PreloadedQuery<userServiceFromSubscriptionQuery>;
  queryRefSubscription: PreloadedQuery<subscriptionByIdQuery>;
  serviceInstance?: serviceInstance_fragment$data;
}

const emptySelectionState = (): SelectionState => ({
  selectAll: false,
  selectedIds: new Set<string>(),
  excludedIds: new Set<string>(),
});

const SubscriptionSlug = ({
  queryRef,
  queryRefSubscription,
  serviceInstance,
}: SubscriptionSlugProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);
  const [editUserService, setEditUserService] = useState<
    userServices_fragment$data | undefined
  >(undefined);
  const [deleteUserServices, setDeleteUserServices] = useState<
    userServices_fragment$data[] | undefined
  >(undefined);
  const [selection, setSelection] =
    useState<SelectionState>(emptySelectionState);

  const { me } = useContext(PortalContext);
  const { setMenuOpen } = useContext(IconActionContext);

  useEffect(() => {
    if (!openSheet && openSheet !== null) setMenuOpen(false);
  }, [openSheet, setMenuOpen]);

  const queryData = usePreloadedQuery<userServiceFromSubscriptionQuery>(
    UserServiceFromSubscription,
    queryRef
  );

  const queryDataSubscription = usePreloadedQuery<subscriptionByIdQuery>(
    SubscriptionById,
    queryRefSubscription
  );
  let breadcrumbValue: BreadcrumbNavLink[] = [];
  if (serviceInstance) {
    breadcrumbValue = [
      { label: 'MenuLinks.Home', href: `/${APP_PATH}` },
      {
        label: `${serviceInstance.name}`,
        original: true,
        href: `/${APP_PATH}/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}`,
      },
      {
        label: t('Service.Management.ManageUsers'),
      },
    ];
  } else {
    breadcrumbValue = [
      { label: 'MenuLinks.Home', href: `/${APP_PATH}` },
      { label: 'MenuLinks.Settings' },
      { label: 'MenuLinks.Service', href: `/${APP_PATH}/admin/service` },
      {
        label: queryDataSubscription.subscriptionById!.service_instance!.name,
        href: `/${APP_PATH}/admin/service/${queryDataSubscription.subscriptionById?.service_instance?.id}`,
        original: true,
      },
      {
        label: queryDataSubscription.subscriptionById!.organization.name,
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

  const canManageService = useCallback(() => {
    return userData.some((userService) => {
      return (
        userService?.user?.id === me?.id &&
        userService?.user_service_capability?.some(
          (user_service_capa) =>
            user_service_capa?.generic_service_capability?.name ===
            ServiceRestrictionEnum.MANAGE_ACCESS
        )
      );
    });
  }, [userData, me?.id]);

  const isBypass = useMemo(
    () =>
      me?.capabilities?.some(
        (capa) => capa?.name === PortalCapabilityEnum.BYPASS
      ) ?? false,
    [me?.capabilities]
  );

  const canManageUserServices = isBypass || canManageService();

  const selectedUserServices = useMemo(() => {
    if (selection.selectAll) {
      return userData.filter(
        (userService) => !selection.excludedIds.has(userService.id)
      );
    }

    return userData.filter((userService) =>
      selection.selectedIds.has(userService.id)
    );
  }, [selection, userData]);

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
        size: -1,
      },
      {
        id: 'capabilities',
        size: 350,
        header: t('Service.Capabilities.CapabilitiesTitle'),
        enableSorting: false,
        cell: ({ row }) => {
          const capabilities = row.original?.user_service_capability ?? [];
          if (
            capabilities.length === 1 &&
            capabilities[0]?.generic_service_capability?.name ===
              ServiceRestrictionEnum.ACCESS
          ) {
            return (
              <Badge className="capitalize">
                {ServiceRestrictionEnum.ACCESS}
              </Badge>
            );
          }
          const capabilityNames = capabilities
            .map((capability) => {
              const genericName = capability?.generic_service_capability?.name;
              const fallbackName =
                capability?.subscription_capability?.service_capability?.name;
              if (genericName === ServiceRestrictionEnum.ACCESS) return null;
              return {
                id: genericName ?? fallbackName,
                name: genericName ?? fallbackName,
              };
            })
            .filter(Boolean);
          return (
            <BadgeOverflowCounter badges={capabilityNames as BadgeOverflow[]} />
          );
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        enableSorting: false,
        enableResizing: false,
        size: 40,
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-end">
              {canManageUserServices && (
                <IconActions
                  icon={
                    <>
                      <MoreVertIcon className="h-4 w-4 text-primary" />
                      <span className="sr-only">{t('Utils.OpenMenu')}</span>
                    </>
                  }>
                  <IconActionsItem
                    onClick={() => setEditUserService(row.original)}>
                    {t('Utils.Update')}
                  </IconActionsItem>
                  <IconActionsItem
                    onClick={() => setDeleteUserServices([row.original])}>
                    {t('Utils.Delete')}
                  </IconActionsItem>
                </IconActions>
              )}
            </div>
          );
        },
      },
    ],
    [canManageUserServices, t]
  );

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
            <Button>
              {t('Service.Management.InviteUser.TitleInviteUser')}
            </Button>
          }
          title={t('InviteUserServiceForm.Title', {
            serviceName:
              queryDataSubscription.subscriptionById!.service_instance!.name,
          })}>
          <UserServiceForm
            connectionId={userServices.userServiceFromSubscription?.__id ?? ''}
            subscription={queryDataSubscription}
          />
        </SheetWithPreventingDialog>
        <DataTableHeadBarOptions />
      </div>
    </div>
  );

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />

      {serviceInstance ||
        (queryDataSubscription.subscriptionById?.service_instance && (
          <ServiceSlugHeader
            serviceInstance={
              (serviceInstance ||
                queryDataSubscription.subscriptionById
                  ?.service_instance) as unknown as serviceInstanceForSubscriptions_fragment$data
            }
          />
        ))}

      <DataTable
        toolbar={toolbar}
        columns={columns}
        data={userData}
        selectionOptions={
          canManageUserServices
            ? {
                selectionState: {
                  state: selection,
                  onSelectionChange: setSelection,
                },
                selectionHeader: {
                  actions: () => (
                    <Button
                      variant="ghost-destructive"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() =>
                        setDeleteUserServices(selectedUserServices)
                      }>
                      <DeleteIcon className="h-4 w-4 m-s" />
                      {t('Utils.Delete')}
                    </Button>
                  ),
                },
              }
            : undefined
        }
        tableOptions={{
          enableRowSelection: (row) =>
            canManageUserServices && !!row.original.id,
        }}
        tableState={{
          pagination,
          columnPinning: { right: ['actions'] },
        }}
      />
      {editUserService && (
        <EditUserService
          key={`edit-${editUserService.id}`}
          userService={editUserService}
          connectionId={userServices.userServiceFromSubscription?.__id ?? ''}
          subscription={queryDataSubscription ?? {}}
          open={!!editUserService}
          setOpen={(open) =>
            setEditUserService(open ? editUserService : undefined)
          }
        />
      )}
      {deleteUserServices && deleteUserServices.length > 0 && (
        <DeleteUserService
          userServices={deleteUserServices}
          isOpen={!!deleteUserServices}
          connectionId={userServices.userServiceFromSubscription?.__id ?? ''}
          onDeleted={() => {
            setSelection(emptySelectionState);
          }}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteUserServices(undefined);
            }
          }}
        />
      )}
    </>
  );
};
export default SubscriptionSlug;
