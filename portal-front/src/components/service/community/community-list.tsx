'use client';

import * as React from 'react';
import { useContext, useMemo, useState } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
  useSubscription,
} from 'react-relay';
import {
  communitiesListFragment,
  ServiceCommunityListQuery,
  subscription,
} from '@/components/service/service.graphql';
import { Button } from 'filigran-ui/servers';
import { DataTable } from 'filigran-ui/clients';
import { ColumnDef, PaginationState, Row } from '@tanstack/react-table';
import Link from 'next/link';
import {
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { Portal, portalContext } from '@/components/portal-context';
import useGranted from '@/hooks/useGranted';
import GuardCapacityComponent from '@/components/admin-guard';
import { ChevronIcon } from 'filigran-icon';
import {
  OrderingMode,
  ServiceOrdering,
  serviceQuery$variables,
} from '../../../../__generated__/serviceQuery.graphql';
import { serviceCommunitiesQuery } from '../../../../__generated__/serviceCommunitiesQuery.graphql';
import { serviceCommunityList_services$key } from '../../../../__generated__/serviceCommunityList_services.graphql';
import { serviceCommunityList_fragment$data } from '../../../../__generated__/serviceCommunityList_fragment.graphql';
import { useLocalStorage } from 'usehooks-ts';
import { CreateCommunity } from '@/components/service/community/community-create';
import { RESTRICTION } from '@/utils/constant';
import { useRouter } from 'next/navigation';

interface CommunityProps {
  queryRef: PreloadedQuery<serviceCommunitiesQuery>;
  columns: ColumnDef<serviceCommunityList_fragment$data>[];
}

//TODO : Remove me.context and avoid when possible optional value in GraphqlTyping ex: ServiceType
const CommunityList: React.FunctionComponent<CommunityProps> = ({
  queryRef,
  columns,
}) => {
  const router = useRouter();
  const [pageSize, setPageSize] = useLocalStorage('countCommunitiesList', 50);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const [orderBy, setOrderBy] = useLocalStorage<ServiceOrdering>(
    'orderModeCommunitiesList',
    'name'
  );
  const [orderMode, setOrderMode] = useLocalStorage<OrderingMode>(
    'orderByCommunitiesList',
    'asc'
  );
  const { me } = useContext<Portal>(portalContext);
  if (!me) {
    return;
  }

  const columnsAdmin: ColumnDef<serviceCommunityList_fragment$data>[] =
    useGranted('FRT_SERVICE_SUBSCRIBER')
      ? useMemo(
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
                        size="icon"
                        variant="ghost">
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
        )
      : [];

  const communityColumns: ColumnDef<serviceCommunityList_fragment$data>[] =
    useMemo(() => [...columns, ...columnsAdmin], [columnsAdmin]);

  const queryData = usePreloadedQuery<serviceCommunitiesQuery>(
    ServiceCommunityListQuery,
    queryRef
  );
  const [data, refetch] = useRefetchableFragment<
    serviceCommunitiesQuery,
    serviceCommunityList_services$key
  >(communitiesListFragment, queryData);

  const connectionID = data.communities.__id;
  const config = useMemo(
    () => ({
      variables: { connections: [connectionID] },
      subscription,
    }),
    [connectionID]
  );
  useSubscription(config);
  const servicesData = data.communities.edges.map(
    ({ node }) => node
  ) as unknown as serviceCommunityList_fragment$data[];

  const handleRefetchData = (args?: Partial<serviceQuery$variables>) => {
    const sorting = mapToSortingTableValue(orderBy, orderMode);
    refetch({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      orderBy,
      orderMode,
      ...transformSortingValueToParams(sorting),
      ...args,
    });
  };

  // https://tanstack.com/table/latest/docs/framework/react/guide/table-state#2-updaters-can-either-be-raw-values-or-callback-functions
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

  const onClickRow = (row: Row<serviceCommunityList_fragment$data>) => {
    router.push(`/admin/service/${row.original.id}`);
  };
  return (
    <>
      <GuardCapacityComponent
        displayError={false}
        capacityRestriction={[
          RESTRICTION.CAPABILITY_BYPASS,
          RESTRICTION.CAPABILITY_BCK_MANAGE_COMMUNITIES,
          RESTRICTION.CAPABILITY_FRT_SERVICE_SUBSCRIBER,
        ]}>
        <div className="flex justify-end pb-m">
          <CreateCommunity
            connectionId={connectionID}
            adminForm={me.capabilities.some(
              (capability) => capability.name === 'BYPASS'
            )}
          />
        </div>
      </GuardCapacityComponent>
      <DataTable
        data={servicesData}
        columns={communityColumns}
        tableOptions={{
          onSortingChange: onSortingChange,
          onPaginationChange: onPaginationChange,
          manualPagination: true,
          rowCount: data.communities.totalCount,
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

export default CommunityList;
