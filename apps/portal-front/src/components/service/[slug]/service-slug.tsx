import { SubscriptionDeleteMutation } from '@/components/subcription/subscription.graphql';
import { serviceCapability_fragment$data } from '@generated/serviceCapability_fragment.graphql';

import { ServiceSlugAddOrgaForm } from '@/components/service/[slug]/service-slug-add-orga-form';
import { ServiceByIdWithSubscriptions } from '@/components/service/service.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from '@/components/ui/breadcrumb-nav';
import {
  IconActions,
  IconActionsItem,
  IconActionsLink,
} from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useAdminPath from '@/hooks/useAdminPath';
import { i18nKey } from '@/utils/datatable';
import { APP_PATH } from '@/utils/path/constant';
import { MoreVertIcon } from '@filigran/icon';
import {
  Button,
  Checkbox,
  DataTable,
  DataTableHeadBarOptions,
  useToast,
  Input,
} from '@filigran/ui';
import { serviceByIdWithSubscriptionsQuery } from '@generated/serviceByIdWithSubscriptionsQuery.graphql';
import { subscriptionDeleteMutation } from '@generated/subscriptionDeleteMutation.graphql';
import { subscriptionWithUserService_fragment$data } from '@generated/subscriptionWithUserService_fragment.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useState } from 'react';
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
  const [shouldDisplayPersonalSpaces, setShouldDisplayPersonalSpaces] =
    useState(false);
  const [removeSubscription, setRemoveSubscription] = useState<
    subscriptionWithUserService_fragment$data | undefined
  >(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdminPath = useAdminPath();

  const { toast } = useToast();
  const t = useTranslations();

  const breadcrumbValue: BreadcrumbNavLink[] = [
    ...(isAdminPath
      ? [
          { label: 'MenuLinks.Home', href: `/${APP_PATH}` },
          { label: 'MenuLinks.Settings' },
          { label: 'MenuLinks.Services', href: `/${APP_PATH}/admin/service` },
        ]
      : [{ label: 'MenuLinks.Home', href: `/${APP_PATH}` }]),
    {
      label: queryData.serviceInstanceByIdWithSubscriptions!.name,
      original: true,
    },
  ];
  const [pagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  });
  const columns: ColumnDef<subscriptionWithUserService_fragment$data>[] = [
    {
      accessorKey: 'organization.name',
      id: 'organizationName',
      header: 'Name',
    },
    {
      id: 'capabilities',
      header: 'Capabilities',
      cell: ({ row }) => {
        const subscriptionCapabilities =
          row.original.subscription_capability?.map(
            (subscription_capability) => {
              return {
                id: subscription_capability?.service_capability?.id,
                name: subscription_capability?.service_capability?.name,
              };
            }
          );
        return (
          <BadgeOverflowCounter
            badges={subscriptionCapabilities as BadgeOverflow[]}
          />
        );
      },
    },
    {
      id: 'actions',
      size: 40,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end">
            <IconActions
              icon={
                <>
                  <MoreVertIcon className="h-4 w-4 text-primary" />
                  <span className="sr-only">{t('Utils.OpenMenu')}</span>
                </>
              }>
              <IconActionsLink
                href={`/${APP_PATH}/admin/service/${row.id}/subscription`}>
                {t('Service.Management.ManageUsers')}
              </IconActionsLink>
              <IconActionsItem
                onClick={() => setRemoveSubscription(row.original)}>
                {t('Utils.Delete')}
              </IconActionsItem>
            </IconActions>
          </div>
        );
      },
    },
  ];

  const removeOrganization = (
    subscription: subscriptionWithUserService_fragment$data
  ) => {
    commitSubscriptionMutation({
      variables: {
        subscription_id: subscription.id,
      },
      onCompleted: () => {
        toast({
          title: t('Utils.Success'),
          description: t('ServiceActions.OrganizationDeleted', {
            name: subscription.organization.name,
          }),
        });
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
      <div className="flex items-center gap-m ml-l">
        <div className="flex items-center">
          <Checkbox
              checked={shouldDisplayPersonalSpaces}
              onCheckedChange={(value) => setShouldDisplayPersonalSpaces(!!value)}
              id="displayPersonalSpaces"
              className=""
          />
          <label
              htmlFor="displayPersonalSpaces"
              className="ml-s">
            {t('Service.Management.ShowPersonalSpaces')}
          </label>
        </div>
        <div className="flex-1 max-w-sm">
          <Input
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              id="SearchTerm"
              placeholder="Search organization..."
          />
        </div>
      </div>

      <div className="flex gap-s flex-wrap ml-auto">
        {useAdminPath() && (
            <SheetWithPreventingDialog
                open={openSheetAddOrga}
                setOpen={setOpenSheetAddOrga}
                trigger={<Button>{t('Service.SubscribeOrganization')}</Button>}
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
              serviceId={serviceId}
              serviceName={
                queryData.serviceInstanceByIdWithSubscriptions?.name ?? ''
              }
            />
          </SheetWithPreventingDialog>
        )}
        <DataTableHeadBarOptions />
      </div>
    </div>
  );

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="pb-s">
        {queryData.serviceInstanceByIdWithSubscriptions?.name}
      </h1>
      <div className="pb-s italic">
        {queryData.serviceInstanceByIdWithSubscriptions?.description}
      </div>
      <div className="pb-s">{t('Service.Management.Description') + ':'}</div>

      <DataTable
        i18nKey={i18nKey(t)}
        columns={columns}
        data={
          (() => {
            const subscriptions = queryData.serviceInstanceByIdWithSubscriptions?.subscriptions ?? [];

            const filteredBySpace = subscriptions.filter(
                (subscription) =>
                    subscription?.organization?.personal_space === shouldDisplayPersonalSpaces
            );

            const filteredBySearch = searchTerm
                ? filteredBySpace.filter((subscription) =>
                    subscription?.organization?.name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
                )
                : filteredBySpace;

            const sorted = [...filteredBySearch].sort((a, b) => {
              const nameA = a?.organization?.name || '';
              const nameB = b?.organization?.name || '';
              return nameA.localeCompare(nameB);
            });

            return sorted as subscriptionWithUserService_fragment$data[];
          })()
        }
        toolbar={toolbar}
        tableState={{
          pagination,
          columnPinning: { right: ['actions'] },
        }}
      />
      {removeSubscription && (
        <AlertDialogComponent
          key={`remove-${removeSubscription.id}`}
          AlertTitle={t('Service.Management.RemoveAccess')}
          actionButtonText={t('Service.Management.RemoveAccess')}
          variantName={'destructive'}
          isOpen={!!removeSubscription}
          onOpenChange={(open) =>
            setRemoveSubscription(open ? removeSubscription : undefined)
          }
          onClickContinue={() => {
            removeOrganization(removeSubscription);
            setRemoveSubscription(undefined);
          }}>
          {'Sure ?'}
        </AlertDialogComponent>
      )}
    </>
  );
};

export default ServiceSlug;
