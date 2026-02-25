'use client';
import { TrialsTabQuotasPlatformUpdate } from '@/components/trials/tab/quotas/trials-tab-quotas-platform-update';
import {
  TrialsDeploymentRequestsAvailableListFragment,
  TrialsDeploymentRequestsAvailableQuery,
} from '@/components/trials/trials.graphql';
import { useExecuteAfterAnimation } from '@/hooks/useExecuteAfterAnimation';
import { useUserHasPortalCapability } from '@/hooks/usePortalCapability';
import { DataTable } from '@filigran/ui';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import { PlatformIdentifier } from '@generated/oneClickDeployMutation.graphql';
import trialsDeploymentAvailabilityFragmentGraphql, {
  trialsDeploymentAvailabilityFragment$data,
  trialsDeploymentAvailabilityFragment$key,
} from '@generated/trialsDeploymentAvailabilityFragment.graphql';
import { trialsDeploymentRequestsAvailableList$key } from '@generated/trialsDeploymentRequestsAvailableList.graphql';
import { trialsDeploymentRequestsAvailableQuery } from '@generated/trialsDeploymentRequestsAvailableQuery.graphql';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import {
  readInlineData,
  useLazyLoadQuery,
  useRefetchableFragment,
} from 'react-relay';

interface Props {
  platformIdentifier: PlatformIdentifier;
}

export const TrialsTabQuotasPlatform: React.FC<Props> = ({
  platformIdentifier,
}) => {
  const t = useTranslations();
  const userHasModifyTrialQuotaCapa = useUserHasPortalCapability([
    PortalCapabilityEnum.MODIFY_TRIALS_QUOTA,
  ]);

  const queryData = useLazyLoadQuery<trialsDeploymentRequestsAvailableQuery>(
    TrialsDeploymentRequestsAvailableQuery,
    { platformIdentifier },
    { fetchPolicy: 'store-and-network' }
  );

  const [data, refetch] = useRefetchableFragment<
    trialsDeploymentRequestsAvailableQuery,
    trialsDeploymentRequestsAvailableList$key
  >(TrialsDeploymentRequestsAvailableListFragment, queryData);
  if (!data.deploymentRequestsAvailable.length) {
    return null;
  }

  const availabilities = useMemo(() => {
    return data.deploymentRequestsAvailable.map((availability) =>
      readInlineData<trialsDeploymentAvailabilityFragment$key>(
        trialsDeploymentAvailabilityFragmentGraphql,
        availability
      )
    );
  }, [data]);

  const [quotaEdit, setQuotaEdit] = useState<
    trialsDeploymentAvailabilityFragment$data | undefined
  >(undefined);

  const columns: ColumnDef<
    { id: string } & trialsDeploymentAvailabilityFragment$data
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
            original: trialsDeploymentAvailabilityFragment$data;
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
      <DataTable
        columns={columns}
        data={dataTableData}
        onClickRow={(row) => setQuotaEdit(row.original)}
      />
      {quotaEdit && userHasModifyTrialQuotaCapa && (
        <TrialsTabQuotasPlatformUpdate
          quota={quotaEdit}
          key={`${quotaEdit.platform_identifier}${quotaEdit.region}`}
          defaultStateOpen={!!quotaEdit}
          onCloseSheet={() => {
            refetch(
              { platformIdentifier },
              { fetchPolicy: 'store-and-network' }
            );
            useExecuteAfterAnimation(() => setQuotaEdit(undefined));
          }}
        />
      )}
    </>
  );
};
