import AddUseCase from '@/components/admin/use-case/AddUseCase';
import EditUseCase from '@/components/admin/use-case/EditUseCase';
import { useExecuteAfterAnimation } from '@/hooks/use-execute-after-animation';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { i18nKey } from '@/utils/datatable';
import { formatName } from '@/utils/format/name';
import { Badge, DataTable } from '@filigran/ui';
import {
  OrderingMode,
  UseCaseOrdering,
  UseCaseRowFragment,
  useUseCasesListQuery,
} from '@graphql/generated';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

const UseCases = () => {
  const t = useTranslations();
  const [useCaseEdit, setUseCaseEdit] = useState<
    UseCaseRowFragment | undefined
  >(undefined);

  const { data: queryData, isError } = useUseCasesListQuery(
    portalGraphqlClient,
    {
      count: 100,
      orderMode: OrderingMode.Asc,
      orderBy: UseCaseOrdering.Name,
    }
  );

  const columns: ColumnDef<UseCaseRowFragment>[] = [
    {
      accessorKey: 'name',
      id: 'name',
      header: t('UseCaseListPage.Name'),
      cell: ({ row }) => {
        return (
          <Badge
            variant="outline"
            color={row.original.color}>
            {formatName(row.original.name)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'color',
      id: 'color',
      header: t('UseCaseListPage.Color'),
      cell: ({ row }) => {
        return <span className="truncate">{row.original.color}</span>;
      },
    },
  ];

  const useCasesData = useMemo<UseCaseRowFragment[]>(() => {
    const edges = queryData?.useCases?.edges ?? [];
    return edges.map(({ node }) => node);
  }, [queryData]);

  return (
    <>
      {isError && (
        <div className="mb-s text-sm text-destructive">{t('Utils.Error')}</div>
      )}
      <DataTable
        columns={columns}
        data={useCasesData}
        i18nKey={i18nKey(t)}
        tableOptions={{
          enableSorting: false,
          enableColumnResizing: false,
          enableColumnPinning: false,
          enableHiding: false,
        }}
        onClickRow={({ original }) => setUseCaseEdit(original)}
        toolbar={
          <div className="flex flex-col-reverse items-center justify-between gap-s sm:flex-row">
            <div />
            <div className="flex w-full items-center justify-between gap-s sm:w-auto">
              <AddUseCase />
            </div>
          </div>
        }
      />
      {useCaseEdit && (
        <EditUseCase
          useCase={useCaseEdit}
          open={!!useCaseEdit}
          onClose={() =>
            useExecuteAfterAnimation(() => setUseCaseEdit(undefined))
          }
        />
      )}
    </>
  );
};

export default UseCases;
