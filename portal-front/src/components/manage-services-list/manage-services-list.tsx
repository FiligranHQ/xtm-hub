'use client';

import * as React from 'react';
import { useContext, useMemo, useState } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import { Button } from 'filigran-ui/servers';
import { ColumnDef, PaginationState, Row } from '@tanstack/react-table';
import Link from 'next/link';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import {
  subscriptionsByOrganizationFetch,
  subscriptionsByOrganizationFragment,
} from '@/components/subcription/subscription.graphql';
import { Portal, portalContext } from '@/components/portal-context';
import useGranted from '@/hooks/useGranted';
import GuardCapacityComponent from '@/components/admin-guard';
import { useLocalStorage } from 'usehooks-ts';
import { CreateCommunity } from '@/components/service/community/community-create';
import { RESTRICTION } from '@/utils/constant';
import { ChevronIcon } from 'filigran-icon';
import {
  subscriptionsByOrganizationSelectQuery,
  subscriptionsByOrganizationSelectQuery$variables,
} from '../../../__generated__/subscriptionsByOrganizationSelectQuery.graphql';
import { subscriptionItem_fragment$data } from '../../../__generated__/subscriptionItem_fragment.graphql';
import { SubscriptionOrdering } from '../../../__generated__/SubscriptionsByOrganizationPaginationQuery.graphql';
import { OrderingMode } from '../../../__generated__/subscriptionsSelectQuery.graphql';
import { subscriptionListByOrganization_subscriptions$key } from '../../../__generated__/subscriptionListByOrganization_subscriptions.graphql';
import { DataTable } from 'filigran-ui/clients';
import { useRouter } from 'next/navigation';

interface RequestListProps {
  queryRef: PreloadedQuery<subscriptionsByOrganizationSelectQuery>;
  columns: ColumnDef<subscriptionItem_fragment$data>[];
}

//TODO : Remove me.context and avoid when possible optional value in GraphqlTyping ex: ServiceType
const ManageServicesList: React.FunctionComponent<RequestListProps> = ({
  queryRef,
  columns,
}) => {
  const { me } = useContext<Portal>(portalContext);
  const router = useRouter();
  if (!me) {
    return;
  }
  const [pageSize, setPageSize] = useLocalStorage('countRequestList', 50);
  const [orderMode, setOrderMode] = useLocalStorage<OrderingMode>(
    'orderModeRequestsList',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage<SubscriptionOrdering>(
    'orderByRequestsList',
    'status'
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const columnsAdmin: ColumnDef<subscriptionItem_fragment$data>[] = useMemo(
    () => [
      {
        id: 'action',
        size: 30,
        enableHiding: false,
        enableSorting: false,
        enableResizing: false,
        cell: ({ row }) => {
          return (
            <>
              <GuardCapacityComponent
                capacityRestriction={['BCK_MANAGE_SERVICES']}>
                <Button
                  asChild
                  variant={'ghost'}
                  size={'icon'}
                  className="w-3/4">
                  <Link href={`/admin/service/${row.original.id}`}>
                    <ChevronIcon className="h-5 w-5" />
                  </Link>
                </Button>
              </GuardCapacityComponent>
            </>
          );
        },
      },
    ],
    []
  );

  const servicesColumns: ColumnDef<subscriptionItem_fragment$data>[] = useMemo(
    () => [
      ...columns,
      ...(useGranted(RESTRICTION.CAPABILITY_BCK_MANAGE_COMMUNITIES)
        ? columnsAdmin
        : []),
    ],
    [columnsAdmin]
  );

  const queryData = usePreloadedQuery<subscriptionsByOrganizationSelectQuery>(
    subscriptionsByOrganizationFetch,
    queryRef
  );
  const [data, refetch] = useRefetchableFragment<
    subscriptionsByOrganizationSelectQuery,
    subscriptionListByOrganization_subscriptions$key
  >(subscriptionsByOrganizationFragment, queryData);

  const handleRefetchData = (
    args?: Partial<subscriptionsByOrganizationSelectQuery$variables>
  ) => {
    const sorting = mapToSortingTableValue<SubscriptionOrdering, OrderingMode>(
      orderBy,
      orderMode
    );
    refetch({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      orderBy,
      orderMode,
      ...transformSortingValueToParams(sorting),
      ...args,
    });
  };

  const onSortingChange = (updater: unknown) => {
    const sorting = mapToSortingTableValue(orderBy, orderMode);
    const newSortingValue =
      updater instanceof Function ? updater(sorting) : updater;
    setOrderBy(newSortingValue[0].id);
    setOrderMode(newSortingValue[0].desc ? 'desc' : 'asc');
    handleRefetchData(transformSortingValueToParams(newSortingValue));
  };

  const onPaginationChange = (updater: unknown) => {
    const newPaginationValue: PaginationState =
      updater instanceof Function ? updater(pagination) : updater;
    handleRefetchData({
      count: newPaginationValue.pageSize,
      cursor: btoa(
        String(newPaginationValue.pageSize * newPaginationValue.pageIndex)
      ),
    });
    setPagination(newPaginationValue);
    if (newPaginationValue.pageSize !== pageSize) {
      setPageSize(newPaginationValue.pageSize);
    }
  };

  const requestsData = data.subscriptionsByOrganization.edges.map(
    ({ node }) => node
  ) as unknown as subscriptionItem_fragment$data[];

  const onClickRow = (row: Row<subscriptionItem_fragment$data>) => {
    router.push(`/admin/service/${row.original.id}`);
  };
  return (
    <>
      <GuardCapacityComponent
        displayError={false}
        capacityRestriction={[
          RESTRICTION.CAPABILITY_BCK_MANAGE_COMMUNITIES,
          RESTRICTION.CAPABILITY_FRT_SERVICE_SUBSCRIBER,
        ]}>
        <div className="flex justify-end pb-m">
          <CreateCommunity
            onCompleted={() => handleRefetchData()}
            adminForm={me.capabilities.some(
              (capability) => capability.name === 'BYPASS'
            )}
          />
        </div>
      </GuardCapacityComponent>
      <DataTable
        data={requestsData}
        columns={servicesColumns}
        tableOptions={{
          onSortingChange: onSortingChange,
          onPaginationChange: onPaginationChange,
          manualPagination: true,
          rowCount: data.subscriptionsByOrganization.totalCount,
          manualSorting: true,
        }}
        tableState={{
          sorting: mapToSortingTableValue(orderBy, orderMode),
          pagination,
        }}
        {...(useGranted(RESTRICTION.CAPABILITY_BCK_MANAGE_COMMUNITIES)
          ? { onClickRow }
          : {})}
      />
    </>
  );
};

export default ManageServicesList;
