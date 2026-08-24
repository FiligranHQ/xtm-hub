'use client';

import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { i18nKey } from '@/utils/datatable';
import { DeleteIcon } from '@filigran/icon';
import { Button, DataTable, SelectionState, toast } from '@filigran/ui';
import {
  BundleUserServiceGroupsQuery,
  PlatformIdentifier,
  useBundleUserServiceGroupsQuery,
  useRemoveUsersFromBundleGroupsMutation,
} from '@graphql/generated';
import { bundleUserServiceGroupsKeys } from '@graphql/service-group/service-group.keys';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<SelectionState>({
    selectAll: false,
    selectedIds: new Set<string>(),
    excludedIds: new Set<string>(),
  });
  const [deletingUserId, setDeletingUserId] = useState<string | undefined>(
    undefined
  );

  const variables = { serviceInstanceId };
  const {
    data: queryData,
    isLoading,
    isError,
  } = useBundleUserServiceGroupsQuery(portalGraphqlClient, variables, {
    queryKey: bundleUserServiceGroupsKeys.list(variables),
  });

  const { mutate: removeUsersFromBundleGroups } =
    useRemoveUsersFromBundleGroupsMutation(portalGraphqlClient, {
      onSuccess: (_data, mutationVariables) => {
        queryClient.setQueryData<BundleUserServiceGroupsQuery>(
          bundleUserServiceGroupsKeys.list(variables),
          (previous) =>
            previous && {
              bundleUserServiceGroups: previous.bundleUserServiceGroups.filter(
                (row) => !mutationVariables.userIds.includes(row.user.id)
              ),
            }
        );
        toast({ title: t('Utils.Success') });
        setDeletingUserId(undefined);
      },
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : 'UnknownError';
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{t(`Error.Server.${errorMessage}`)}</>,
        });
        setDeletingUserId(undefined);
      },
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
        cell: ({ row }) => (
          <AlertDialogComponent
            AlertTitle={t(
              'Service.Bundle.ManageTrial.Table.DeleteDialog.Title'
            )}
            actionButtonText={t('Utils.Delete')}
            variantName="destructive"
            continueButtonDisabled={deletingUserId === row.original.id}
            triggerElement={
              <Button
                type="button"
                variant="tertiary"
                size="icon"
                aria-label={t('Utils.Delete')}
                disabled={deletingUserId === row.original.id}>
                <DeleteIcon className="h-4 w-4" />
              </Button>
            }
            onClickContinue={() => {
              setDeletingUserId(row.original.id);
              removeUsersFromBundleGroups({
                serviceInstanceId,
                userIds: [row.original.id],
              });
            }}>
            {t('Service.Bundle.ManageTrial.Table.DeleteDialog.Text', {
              email: row.original.email,
            })}
          </AlertDialogComponent>
        ),
      },
    ],
    [t, deletingUserId, removeUsersFromBundleGroups, serviceInstanceId]
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
