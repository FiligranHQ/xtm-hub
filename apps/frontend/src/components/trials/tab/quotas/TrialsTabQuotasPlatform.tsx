'use client';
import { TrialsTabQuotasPlatformUpdate } from '@/components/trials/tab/quotas/TrialsTabQuotasPlatformUpdate';
import { TrialsScope, trialsRegionKey } from '@/components/trials/trials.const';
import { useUserHasPortalCapability } from '@/hooks/use-portal-capability';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { DataTable } from '@filigran/ui';
import { trialsQuotasKeys } from '@graphql/deployment/deployment.keys';
import {
  PortalCapability,
  TrialsQuotaFragment,
  useTrialsQuotasQuery,
} from '@graphql/generated';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

type QuotaRow = TrialsQuotaFragment & { id: string };

interface TrialsTabQuotasPlatformProps {
  scope: TrialsScope;
}

export const TrialsTabQuotasPlatform = ({
  scope,
}: TrialsTabQuotasPlatformProps) => {
  const t = useTranslations();
  const userHasModifyTrialQuotaCapa = useUserHasPortalCapability([
    PortalCapability.ModifyTrialsQuota,
  ]);
  const [quotaEdit, setQuotaEdit] = useState<QuotaRow | undefined>(undefined);

  const variables = useMemo(
    () => ({
      platformIdentifier:
        scope.kind === 'product' ? scope.platformIdentifier : null,
    }),
    [scope]
  );

  const { data } = useTrialsQuotasQuery(portalGraphqlClient, variables, {
    queryKey: trialsQuotasKeys.list(variables),
  });

  const columns: ColumnDef<QuotaRow>[] = useMemo(
    () => [
      {
        accessorKey: 'region',
        id: 'region',
        header: t('TrialsDashboard.Columns.Region'),
        enableSorting: false,
        cell: ({ row }: { row: { original: QuotaRow } }) => {
          return <span>{t(trialsRegionKey(row.original.region))}</span>;
        },
      },
      {
        accessorKey: 'availableCount',
        id: 'available',
        header: t('TrialsDashboard.Columns.Available'),
        enableSorting: false,
      },
      {
        accessorFn: (originalRow) =>
          originalRow.capacity - originalRow.availableCount,
        id: 'taken',
        header: t('TrialsDashboard.Columns.Taken'),
        enableSorting: false,
      },
      {
        accessorKey: 'capacity',
        id: 'total',
        header: t('TrialsDashboard.Columns.Total'),
        enableSorting: false,
      },
    ],
    [t]
  );

  const dataTableData = useMemo(
    () =>
      (data?.deploymentRequestsAvailable ?? [])
        .map((availability) => ({
          ...availability,
          id: availability.region,
        }))
        .sort((a, b) =>
          t(trialsRegionKey(a.region)).localeCompare(
            t(trialsRegionKey(b.region))
          )
        ),
    [data, t]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={dataTableData}
        onClickRow={(row) => setQuotaEdit(row.original)}
      />
      {quotaEdit && userHasModifyTrialQuotaCapa && (
        <TrialsTabQuotasPlatformUpdate
          quota={quotaEdit}
          scope={scope}
          key={`${quotaEdit.platform_identifier}${quotaEdit.region}`}
          defaultStateOpen={!!quotaEdit}
          onCloseSheet={() => setQuotaEdit(undefined)}
        />
      )}
    </>
  );
};
