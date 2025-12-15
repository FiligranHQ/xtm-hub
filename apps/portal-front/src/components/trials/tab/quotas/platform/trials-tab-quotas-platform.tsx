import { TrialsDeploymentAvailabilityFragment } from '@/components/trials/trials.graphql';
import { PlatformIdentifier } from '@generated/oneClickDeployMutation.graphql';
import {
  trialsDeploymentAvailabilityFragment$data,
  trialsDeploymentAvailabilityFragment$key,
} from '@generated/trialsDeploymentAvailabilityFragment.graphql';
import TrialsDeploymentRequestsAvailableQueryGraphql, {
  trialsDeploymentRequestsAvailableQuery,
} from '@generated/trialsDeploymentRequestsAvailableQuery.graphql';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';

interface Props {
  platformIdentifier: PlatformIdentifier;
}

export const TrialsTabQuotasPlatform: React.FC<Props> = ({
  platformIdentifier,
}) => {
  const t = useTranslations();
  const queryData = useLazyLoadQuery<trialsDeploymentRequestsAvailableQuery>(
    TrialsDeploymentRequestsAvailableQueryGraphql,
    { platformIdentifier }
  );

  const availabilities = useFragment<trialsDeploymentAvailabilityFragment$key>(
    TrialsDeploymentAvailabilityFragment,
    queryData.deploymentRequestsAvailable
  );
  if (!availabilities.length) {
    return null;
  }

  const columns: ColumnDef<
    { id: string } & trialsDeploymentAvailabilityFragment$data[number]
  >[] = useMemo(
    () => [
      {
        accessorKey: 'region',
        id: 'region',
        header: t('TrialsDashboard.Columns.Region'),
        enableSorting: false,
        cell: ({
          row,
        }: {
          row: {
            original: trialsDeploymentAvailabilityFragment$data[number];
          };
        }) => {
          return (
            <span>{t(`Region.${row.original.region.toUpperCase()}`)}</span>
          );
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

  const dataTableData = useMemo(() => {
    return availabilities
      .map((availability) => ({
        ...availability,
        id: availability.region,
      }))
      .sort((a, b) =>
        t(`Region.${a.region.toUpperCase()}`).localeCompare(
          t(`Region.${b.region.toUpperCase()}`)
        )
      );
  }, [availabilities, t]);

  return (
    <>
      <h2 className="mt-xxl">
        {t(`PlatformIdentifier.${platformIdentifier}`)}
      </h2>
      <DataTable
        columns={columns}
        data={dataTableData}
      />
    </>
  );
};
