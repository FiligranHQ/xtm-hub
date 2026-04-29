'use client';

import { useOrganizationListLocalstorage } from '@/components/organization/organization-list-localstorage';
import {
  handleSortingChange,
  mapToSortingTableValue,
  transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import { MoreVertIcon } from '@filigran/icon';
import { Badge, DataTable, DataTableHeadBarOptions } from '@filigran/ui';
import { OrganizationsPaginationQuery$variables } from '@generated/OrganizationsPaginationQuery.graphql';
import { OrganizationOrderingEnum } from '@generated/models/OrganizationOrdering.enum';
import { organizationItem_fragment$data } from '@generated/organizationItem_fragment.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { FunctionComponent, Suspense, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { IconActions, IconActionsItem } from '@/components/ui/IconActions';
import { SearchInput } from '@/components/ui/SearchInput';
import { CreateOrganization } from '@/components/organization/CreateOrganization';
import { DeleteOrganization } from '@/components/organization/DeleteOrganization';
import { EditOrganization } from '@/components/organization/EditOrganization';
import { getOrganizations } from '@/components/organization/Organization.service';
const OrganizationList: FunctionComponent = () => {
  const t = useTranslations();
  const [editOrganization, setEditOrganization] = useState<
    organizationItem_fragment$data | undefined
  >(undefined);
  const [deleteOrganization, setDeleteOrganization] = useState<
    organizationItem_fragment$data | undefined
  >(undefined);
  const columns: ColumnDef<organizationItem_fragment$data>[] = [
    {
      accessorKey: 'name',
      id: 'name',
      header: t('OrganizationForm.Name'),
      cell: ({ row }) => {
        return <>{row.original.name}</>;
      },
    },
    {
      accessorKey: 'domains',
      id: 'domains',
      header: t('OrganizationForm.Domains'),
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <div className="flex space-x-s">
            {row.original.domains?.map((domain) => (
              <Badge
                className="truncate"
                key={domain}>
                {domain}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      size: 100,
      enableHiding: false,
      enableSorting: false,
      enableResizing: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <IconActions
            icon={
              <>
                <MoreVertIcon className="h-4 w-4 text-primary" />
                <span className="sr-only">{t('Utils.OpenMenu')}</span>
              </>
            }>
            <IconActionsItem onClick={() => setEditOrganization(row.original)}>
              {t('Utils.Update')}
            </IconActionsItem>
            <IconActionsItem
              onClick={() => setDeleteOrganization(row.original)}>
              {t('Utils.Delete')}
            </IconActionsItem>
          </IconActions>
        </div>
      ),
    },
  ];
  const {
    pageSize,
    setPageSize,
    orderMode,
    setOrderMode,
    orderBy,
    setOrderBy,
    removeOrder,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    resetAll,
  } = useOrganizationListLocalstorage(columns);

  const [organizationData, refetch] = getOrganizations({
    count: pageSize,
    orderMode,
    orderBy,
  });
  const organizationDataTable = organizationData.organizations.edges.map(
    ({ node }) => node
  ) as organizationItem_fragment$data[];

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const handleRefetchData = (
    args?: Partial<OrganizationsPaginationQuery$variables>
  ) => {
    const sorting = mapToSortingTableValue(orderBy, orderMode);
    refetch({
      count: pagination.pageSize,
      cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
      orderBy,
      orderMode,
      searchTerm: undefined,
      ...transformSortingValueToParams(sorting),
      ...args,
    });
  };

  const onSortingChange = (updater: unknown) => {
    handleSortingChange<OrganizationOrderingEnum>({
      updater,
      orderBy,
      orderMode,
      setOrderMode,
      setOrderBy,
      removeOrder,
      handleRefetchData,
    });
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

  const handleInputChange = (inputValue: string) => {
    handleRefetchData({ searchTerm: inputValue });
  };

  const debounceHandleInput = useDebounceCallback(
    (e) => handleInputChange(e.target.value),
    DEBOUNCE_TIME
  );

  return (
    <>
      <Suspense
        fallback={
          <DataTable
            i18nKey={i18nKey(t)}
            data={[]}
            columns={columns}
            isLoading={true}
          />
        }>
        <DataTable
          columns={columns}
          data={organizationDataTable}
          toolbar={
            <div className="flex flex-col-reverse items-center justify-between gap-s sm:flex-row">
              <label
                htmlFor="organization-email"
                className="sr-only">
                {t('OrganizationActions.SearchOrganizationWithEmail')}
              </label>
              <SearchInput
                id="organization-email"
                containerClass="w-full sm:w-1/3"
                placeholder={t(
                  'OrganizationActions.SearchOrganizationWithEmail'
                )}
                onChange={debounceHandleInput}
              />
              <div className="flex w-full items-center justify-between gap-s sm:w-auto">
                <DataTableHeadBarOptions />
                <CreateOrganization
                  connectionId={organizationData.organizations.__id}
                />
              </div>
            </div>
          }
          onResetTable={resetAll}
          tableOptions={{
            onSortingChange: onSortingChange,
            onPaginationChange: onPaginationChange,
            manualSorting: true,
            manualPagination: true,
            onColumnOrderChange: setColumnOrder,
            onColumnVisibilityChange: setColumnVisibility,
            rowCount: organizationData.organizations.totalCount,
          }}
          i18nKey={i18nKey(t)}
          tableState={{
            sorting: mapToSortingTableValue(orderBy, orderMode),
            pagination,
            columnOrder,
            columnVisibility,
            columnPinning: {
              right: ['actions'],
            },
          }}
        />
      </Suspense>
      {editOrganization && (
        <EditOrganization
          key={`edit-${editOrganization.id}`}
          organization={editOrganization}
          open={!!editOrganization}
          setOpen={(open) =>
            setEditOrganization(open ? editOrganization : undefined)
          }
        />
      )}
      {deleteOrganization && (
        <DeleteOrganization
          key={`delete-${deleteOrganization.id}`}
          connectionId={organizationData.organizations.__id}
          organization={deleteOrganization}
          open={!!deleteOrganization}
          setOpen={(open) =>
            setDeleteOrganization(open ? deleteOrganization : undefined)
          }
        />
      )}
    </>
  );
};
export default OrganizationList;
