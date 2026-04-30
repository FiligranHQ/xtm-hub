import { ServiceByIdWithSubscriptions } from '@/components/service/service.graphql';
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
import { MoreVertIcon } from '@filigran/icon';
import {
  Checkbox,
  DataTable,
  DataTableHeadBarOptions,
} from '@filigran/ui';
import { serviceByIdWithSubscriptionsQuery } from '@generated/serviceByIdWithSubscriptionsQuery.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import useAdminPath from '@/hooks/use-admin-path';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import { APP_PATH } from '@/utils/path/constant';
import { subscription_fragment$data } from '@generated/subscription_fragment.graphql';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { useDebounceCallback } from 'usehooks-ts';
import { ServiceSlugAddSubscription } from './ServiceSlugAddSubscription';
import { ServiceSlugDeleteSubscription } from './ServiceSlugDeleteSubscription';

interface ServiceSlugProps {
  subscriptions: subscription_fragment$data[];
  queryRefServiceInstance: PreloadedQuery<serviceByIdWithSubscriptionsQuery>;
  subscriptionConnectionId: string;
}

const ServiceSlug = ({ subscriptions, queryRefServiceInstance, subscriptionConnectionId }: ServiceSlugProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const queryDataRequest = usePreloadedQuery<serviceByIdWithSubscriptionsQuery>(
    ServiceByIdWithSubscriptions,
    queryRefServiceInstance
  );

  const [shouldDisplayPersonalSpaces, setShouldDisplayPersonalSpaces] =
    useState(false);
  const [deleteSubscription, setDeleteSubscription] = useState<
    subscription_fragment$data | undefined
  >(undefined);

  const debounceHandleInput = useDebounceCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    DEBOUNCE_TIME
  );

  const isAdminPath = useAdminPath();

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
      label: queryDataRequest.serviceInstanceById?.name ?? '',
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
            </IconActions>
          </div>
        );
      },
    },
  ];

  const toolbar = (
    <div className="flex justify-between flex-wrap gap-s pt-s">
      <div className="flex items-center gap-m ml-l">
        <div className="flex items-center">
          <Checkbox
            checked={shouldDisplayPersonalSpaces}
            onCheckedChange={(value) => setShouldDisplayPersonalSpaces(!!value)}
            id="displayPersonalSpaces"
          />
          <label
            htmlFor="displayPersonalSpaces"
            className="ml-s">
            {t('Service.Management.ShowPersonalSpaces')}
          </label>
        </div>
        <div className="flex-1 max-w-sm">
          <SearchInput
            id="SearchTerm"
            placeholder={t('Service.Management.SearchOrganization')}
            onChange={debounceHandleInput}
          />
        </div>
      </div>

      <div className="flex gap-s flex-wrap ml-auto">
        <ServiceSlugAddSubscription
          isAdminPath={!!isAdminPath}
          subscriptions={subscriptions}
          serviceInstance={queryDataRequest.serviceInstanceById}
          subscriptionConnectionId={subscriptionConnectionId}
        />
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

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="pb-s">{queryDataRequest.serviceInstanceById?.name}</h1>
      <div className="pb-s italic">
        {queryDataRequest.serviceInstanceById?.description}
      </div>
      <div className="pb-s">{t('Service.Management.Description') + ':'}</div>

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
