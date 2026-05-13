import {
  ServiceInstanceByIdQuery,
  serviceInstanceForSubscriptionsFragment,
} from '@/components/service/service.graphql';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/BadgeOverflowCounter';
import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from '@/components/ui/BreadcrumbNav';
import {
  IconActions,
  IconActionsItem,
  IconActionsLink,
} from '@/components/ui/IconActions';
import { SearchInput } from '@/components/ui/SearchInput';
import useAdminPath from '@/hooks/use-admin-path';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import { formatName } from '@/utils/format/name';
import { APP_PATH } from '@/utils/path/constant';
import { MoreVertIcon } from '@filigran/icon';
import {
  Badge,
  DataTable,
  DataTableHeadBarOptions,
  Switch,
} from '@filigran/ui';
import { serviceInstanceByIdQuery } from '@generated/serviceInstanceByIdQuery.graphql';
import { serviceInstanceForSubscriptions_fragment$key } from '@generated/serviceInstanceForSubscriptions_fragment.graphql';
import { subscription_fragment$data } from '@generated/subscription_fragment.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';
import { useDebounceCallback } from 'usehooks-ts';
import { ServiceSlugDeleteSubscription } from './ServiceSlugDeleteSubscription';
import { ServiceSlugSubscription } from './ServiceSlugSubscription';

interface ServiceSlugProps {
  subscriptions: subscription_fragment$data[];
  queryRefServiceInstance: PreloadedQuery<serviceInstanceByIdQuery>;
  subscriptionConnectionId: string;
}

const ServiceSlug = ({
  subscriptions,
  queryRefServiceInstance,
  subscriptionConnectionId,
}: ServiceSlugProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const queryDataRequest = usePreloadedQuery<serviceInstanceByIdQuery>(
    ServiceInstanceByIdQuery,
    queryRefServiceInstance
  );
  const serviceInstanceRef = queryDataRequest.serviceInstanceById;

  if (!serviceInstanceRef) {
    return null;
  }

  const serviceInstance =
    readInlineData<serviceInstanceForSubscriptions_fragment$key>(
      serviceInstanceForSubscriptionsFragment,
      serviceInstanceRef
    );
  const [shouldDisplayPersonalSpaces, setShouldDisplayPersonalSpaces] =
    useState(false);
  const [deleteSubscription, setDeleteSubscription] = useState<
    subscription_fragment$data | undefined
  >(undefined);
  const [updateSubscription, setUpdateSubscription] = useState<
    subscription_fragment$data | undefined
  >(undefined);
  const [openEdit, setOpenEdit] = useState(false);

  const isAdminPath = useAdminPath();

  const t = useTranslations();

  const debounceHandleInput = useDebounceCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    DEBOUNCE_TIME
  );

  const breadcrumbValue: BreadcrumbNavLink[] = [
    ...(isAdminPath
      ? [
          { label: 'MenuLinks.Home', href: `/${APP_PATH}` },
          { label: 'MenuLinks.Settings' },
          { label: 'MenuLinks.Services', href: `/${APP_PATH}/admin/service` },
        ]
      : [{ label: 'MenuLinks.Home', href: `/${APP_PATH}` }]),
    {
      label: serviceInstance.name,
      original: true,
    },
  ];
  const [pagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  });
  const columns: ColumnDef<subscription_fragment$data>[] = [
    {
      accessorKey: 'organization.name',
      id: 'organizationName',
      header: 'Name',
    },
    {
      id: 'capabilities',
      header: 'Capabilities',
      cell: ({ row }) => {
        const subscriptionCapabilities: BadgeOverflow[] = (
          row.original.subscription_capability ?? []
        ).flatMap((subscriptionCapability) => {
          const capability = subscriptionCapability?.service_capability;
          if (!capability?.id || !capability.name) {
            return [];
          }

          return [
            {
              id: capability.id,
              name: capability.name,
            },
          ];
        });

        return <BadgeOverflowCounter badges={subscriptionCapabilities} />;
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
                onClick={() => setDeleteSubscription(row.original)}>
                {t('Utils.Delete')}
              </IconActionsItem>
              <IconActionsItem
                onClick={() => {
                  setUpdateSubscription(row.original);
                  setOpenEdit(true);
                }}>
                {t('Utils.Edit')}
              </IconActionsItem>
            </IconActions>
          </div>
        );
      },
    },
  ];

  const toolbar = (
    <div className="flex justify-between flex-wrap gap-s pt-s">
      <div className="flex items-center gap-m ml-l">
        <div className="flex-1 max-w-sm">
          <SearchInput
            id="SearchTerm"
            placeholder={t('Service.Management.SearchOrganization')}
            onChange={debounceHandleInput}
          />
        </div>
        <div className="flex items-center">
          <Switch
            checked={shouldDisplayPersonalSpaces}
            onCheckedChange={(value) => setShouldDisplayPersonalSpaces(value)}
            id="displayPersonalSpaces"
          />
          <label
            htmlFor="displayPersonalSpaces"
            className="ml-s">
            {t('Service.Management.ShowPersonalSpaces')}
          </label>
        </div>
      </div>

      <div className="flex gap-s flex-wrap ml-auto">
        <DataTableHeadBarOptions />
      </div>
    </div>
  );

  const filteredAndSortedData = useMemo(() => {
    const filteredBySpace = subscriptions.filter(
      (subscription) =>
        subscription?.organization?.personal_space ===
        shouldDisplayPersonalSpaces
    );

    return searchTerm
      ? filteredBySpace.filter((subscription) => {
          const orgName = subscription?.organization?.name;
          return orgName?.toLowerCase().includes(searchTerm.toLowerCase());
        })
      : filteredBySpace;
  }, [subscriptions, shouldDisplayPersonalSpaces, searchTerm]);

  const availableCapabilities: BadgeOverflow[] = useMemo(
    () =>
      (serviceInstance.service_definition?.service_capability ?? []).flatMap(
        (capability) => {
          if (!capability?.id || !capability.name) {
            return [];
          }

          return [
            {
              id: capability.id,
              name: capability.name,
            },
          ];
        }
      ),
    [serviceInstance.service_definition?.service_capability]
  );

  const serviceTags = useMemo(
    () =>
      (serviceInstance.tags ?? [])
        .filter((tag) => !!tag)
        .map((tag) => ({
          id: tag,
          name: tag,
        })),
    [serviceInstance.tags]
  );

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <div>
        <div className="flex flex-col gap-m mb-m">
          <div className="flex flex-row gap-m">
            <h1>{serviceInstance.name}</h1>
            <BadgeOverflowCounter badges={serviceTags as BadgeOverflow[]} />
            <div className="ml-auto">
              <ServiceSlugSubscription
                isAdminPath={!!isAdminPath}
                subscriptions={subscriptions}
                subscriptionToEdit={updateSubscription}
                serviceInstance={serviceInstance}
                subscriptionConnectionId={subscriptionConnectionId}
                openEdit={openEdit}
                setOpenEdit={(open) => {
                  setOpenEdit(open);
                  if (!open) setUpdateSubscription(undefined);
                }}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic line-clamp-3">
            {serviceInstance.description ??
              t('Service.Management.NoDescription')}
          </p>
          <div>
            <p className="text-xs uppercase text-muted-foreground pb-xs">
              {t('Service.Management.AvailableCapabilities')}
            </p>
            {availableCapabilities.length > 0 ? (
              <div className="flex flex-wrap gap-xs">
                {availableCapabilities.map((capability) => (
                  <Badge key={capability.id}>
                    {formatName(capability.name)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('Service.Management.NoAvailableCapabilities')}
              </p>
            )}
          </div>
        </div>

        <div className="border rounded bg-page-background p-m">
          <h2 className="">{t('Service.Management.Description') + ':'}</h2>

          <DataTable
            i18nKey={i18nKey(t)}
            columns={columns}
            data={filteredAndSortedData}
            toolbar={toolbar}
            tableState={{
              pagination,
              columnPinning: { right: ['actions'] },
            }}
          />
        </div>
      </div>

      {deleteSubscription && (
        <ServiceSlugDeleteSubscription
          subscription={deleteSubscription}
          subscriptionConnectionId={subscriptionConnectionId}
          open={!!deleteSubscription}
          setOpen={(open) =>
            setDeleteSubscription(open ? deleteSubscription : undefined)
          }
        />
      )}
    </>
  );
};

export default ServiceSlug;
