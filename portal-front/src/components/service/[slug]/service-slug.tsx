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
import { IconActions, IconActionsLink } from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useAdminPath from '@/hooks/useAdminPath';
import { i18nKey } from '@/utils/datatable';
import { serviceByIdWithSubscriptionsQuery } from '@generated/serviceByIdWithSubscriptionsQuery.graphql';
import { subscriptionDeleteMutation } from '@generated/subscriptionDeleteMutation.graphql';
import { subscriptionWithUserService_fragment$data } from '@generated/subscriptionWithUserService_fragment.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import {
  Button,
  Checkbox,
  DataTable,
  DataTableHeadBarOptions,
  useToast,
} from 'filigran-ui';
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

  const isAdminPath = useAdminPath();

  const { toast } = useToast();
  const t = useTranslations();

  const breadcrumbValue: BreadcrumbNavLink[] = [
    ...(isAdminPath
      ? [
          { label: 'MenuLinks.Home', href: '/' },
          { label: 'MenuLinks.Settings' },
          { label: 'MenuLinks.Services', href: '/admin/service' },
        ]
      : [{ label: 'MenuLinks.Home', href: '/' }]),
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
              <IconActionsLink href={`/admin/service/${row.id}/subscription`}>
                {t('Service.Management.ManageUsers')}
              </IconActionsLink>
              <AlertDialogComponent
                AlertTitle={t('Service.Management.RemoveAccess')}
                actionButtonText={t('Service.Management.RemoveAccess')}
                variantName={'destructive'}
                triggerElement={
                  <Button
                    variant="ghost"
                    className="w-full justify-start normal-case"
                    aria-label={t('Utils.Delete')}>
                    {t('Utils.Delete')}
                  </Button>
                }
                onClickContinue={() =>
                  removeOrganization(
                    row.original as subscriptionWithUserService_fragment$data
                  )
                }>
                {'Sure ?'}
              </AlertDialogComponent>
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
      <div className="flex items-center ml-l">
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
          (queryData.serviceInstanceByIdWithSubscriptions?.subscriptions?.filter(
            (subscription) =>
              subscription?.organization?.personal_space ===
              shouldDisplayPersonalSpaces
          ) as subscriptionWithUserService_fragment$data[]) ??
          ([] as subscriptionWithUserService_fragment$data[])
        }
        toolbar={toolbar}
        tableState={{
          pagination,
          columnPinning: { right: ['actions'] },
        }}
      />
    </>
  );
};

export default ServiceSlug;
