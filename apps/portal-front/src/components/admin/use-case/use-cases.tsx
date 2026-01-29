import AddUseCase from '@/components/admin/use-case/add-use-case';
import EditUseCase from '@/components/admin/use-case/edit-use-case';
import {
  useCaseFragment,
  useCaseListFragment,
  UseCaseListQuery,
} from '@/components/admin/use-case/use-case.graphql';
import { useExecuteAfterAnimation } from '@/hooks/useExecuteAfterAnimation';
import { i18nKey } from '@/utils/datatable';
import { formatName } from '@/utils/format/name';
import { Badge, DataTable } from '@filigran/ui';
import { useCaseListQuery } from '@generated/useCaseListQuery.graphql';
import {
  useCase_fragment$data,
  useCase_fragment$key,
} from '@generated/useCase_fragment.graphql';
import { useCase_list_fragment$key } from '@generated/useCase_list_fragment.graphql';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import {
  readInlineData,
  useLazyLoadQuery,
  useRefetchableFragment,
} from 'react-relay';

const UseCases = () => {
  const t = useTranslations();
  const queryData = useLazyLoadQuery<useCaseListQuery>(UseCaseListQuery, {
    count: 100,
    orderMode: 'asc',
    orderBy: 'name',
  });

  const [data] = useRefetchableFragment<
    useCaseListQuery,
    useCase_list_fragment$key
  >(useCaseListFragment, queryData);
  const [useCaseEdit, setUseCaseEdit] = useState<
    useCase_fragment$data | undefined
  >(undefined);

  const columns: ColumnDef<useCase_fragment$data>[] = [
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

  const useCasesData = useMemo<useCase_fragment$data[]>(
    () =>
      data.useCases?.edges?.map?.(({ node }) =>
        readInlineData<useCase_fragment$key>(useCaseFragment, node)
      ) as useCase_fragment$data[],
    [data]
  );

  return (
    <>
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
        onClickRow={({ original }) =>
          setUseCaseEdit(original as useCase_fragment$data)
        }
        toolbar={
          <div className="flex flex-col-reverse items-center justify-between gap-s sm:flex-row">
            <div />
            <div className="flex w-full items-center justify-between gap-s sm:w-auto">
              <AddUseCase connectionId={data!.useCases!.__id} />
            </div>
          </div>
        }
      />
      {useCaseEdit && (
        <EditUseCase
          useCase={useCaseEdit}
          open={!!useCaseEdit}
          connections={[data!.useCases!.__id]}
          onClose={() =>
            useExecuteAfterAnimation(() => setUseCaseEdit(undefined))
          }
        />
      )}
    </>
  );
};

export default UseCases;
