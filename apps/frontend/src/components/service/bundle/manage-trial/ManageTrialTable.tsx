'use client';

import { portalGraphqlClient } from '@/lib/graphql-client';
import { i18nKey } from '@/utils/datatable';
import { DeleteIcon } from '@filigran/icon';
import { DataTable, SelectionState } from '@filigran/ui';
import {
  BundleUserServiceGroupsQuery,
  PlatformIdentifier,
  useBundleUserServiceGroupsQuery,
} from '@graphql/generated';
import { bundleUserServiceGroupsKeys } from '@graphql/service-group/service-group.keys';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

interface ManageTrialTableProps {
  serviceInstanceId: string;
}

interface ManageTrialTableRow {
  id: string;
  email: string;
  openctiRole: string;
  openaevRole: string;
  xtmoneRole: string;
}

const findRoleName = (
  groups: BundleUserServiceGroupsQuery['bundleUserServiceGroups'][number]['groups'],
  platformIdentifier: PlatformIdentifier
) =>
  groups.find((group) => group.platformIdentifier === platformIdentifier)
    ?.name ?? '—';

export const ManageTrialTable = ({
  serviceInstanceId,
}: ManageTrialTableProps) => {
  const t = useTranslations();
  const [selection, setSelection] = useState<SelectionState>({
    selectAll: false,
    selectedIds: new Set<string>(),
    excludedIds: new Set<string>(),
  });

  const variables = { serviceInstanceId };
  const {
    data: queryData,
    isLoading,
    isError,
  } = useBundleUserServiceGroupsQuery(portalGraphqlClient, variables, {
    queryKey: bundleUserServiceGroupsKeys.list(variables),
  });

  const rows = useMemo<ManageTrialTableRow[]>(
    () =>
      (queryData?.bundleUserServiceGroups ?? []).map((row) => ({
        id: row.user.id,
        email: row.user.email,
        openctiRole: findRoleName(row.groups, PlatformIdentifier.Opencti),
        openaevRole: findRoleName(row.groups, PlatformIdentifier.Openaev),
        xtmoneRole: findRoleName(row.groups, PlatformIdentifier.Xtmone),
      })),
    [queryData]
  );

  const columns = useMemo<ColumnDef<ManageTrialTableRow>[]>(
    () => [
      {
        accessorKey: 'email',
        id: 'email',
        header: t('Service.Bundle.ManageTrial.Table.Email'),
      },
      {
        accessorKey: 'openctiRole',
        id: 'opencti_role',
        header: t('Service.Bundle.ManageTrial.Table.OpenCTIRole'),
      },
      {
        accessorKey: 'openaevRole',
        id: 'openaev_role',
        header: t('Service.Bundle.ManageTrial.Table.OpenAEVRole'),
      },
      {
        accessorKey: 'xtmoneRole',
        id: 'xtmone_role',
        header: t('Service.Bundle.ManageTrial.Table.XtmOne'),
      },
      {
        id: 'actions',
        enableHiding: false,
        enableSorting: false,
        enableResizing: false,
        size: 48,
        cell: () => (
          <button
            type="button"
            disabled
            aria-label={t('Utils.Delete')}
            className="flex items-center justify-end text-text-default-disabled">
            <DeleteIcon className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [t]
  );

  return (
    <>
      {isError && (
        <div className="text-sm text-destructive">{t('Utils.Error')}</div>
      )}
      {!isError && !isLoading && rows.length === 0 && (
        <div className="text-sm text-content-body-secondary">
          {t('Service.Bundle.ManageTrial.Table.NoUsers')}
        </div>
      )}
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        i18nKey={i18nKey(t)}
        toolbar={<></>}
        selectionOptions={{
          selectionState: {
            state: selection,
            onSelectionChange: setSelection,
          },
        }}
      />
    </>
  );
};
