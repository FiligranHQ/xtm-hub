import AddLabel from '@/components/admin/label/add-label';
import EditLabel from '@/components/admin/label/edit-label';
import {
  labelFragment,
  labelListFragment,
  LabelListQuery,
} from '@/components/admin/label/label.graphql';
import { useExecuteAfterAnimation } from '@/hooks/useExecuteAfterAnimation';
import { i18nKey } from '@/utils/datatable';
import { labelListQuery } from '@generated/labelListQuery.graphql';
import { labelList_labels$key } from '@generated/labelList_labels.graphql';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, DataTable } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import {
  readInlineData,
  useLazyLoadQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
  label_fragment$data,
  label_fragment$key,
} from '../../../../__generated__/label_fragment.graphql';

const Labels = () => {
  const t = useTranslations();
  const queryData = useLazyLoadQuery<labelListQuery>(LabelListQuery, {
    count: 100,
    orderMode: 'desc',
    orderBy: 'name',
  });

  const [data] = useRefetchableFragment<labelListQuery, labelList_labels$key>(
    labelListFragment,
    queryData
  );
  const [labelEdit, setLabelEdit] = useState<label_fragment$data | undefined>(
    undefined
  );

  const columns: ColumnDef<label_fragment$data>[] = [
    {
      accessorKey: 'name',
      id: 'name',
      header: t('LabelListPage.Name'),
      cell: ({ row }) => {
        return (
          <Badge
            variant="outline"
            color={row.original.color}>
            {row.original.name}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'color',
      id: 'color',
      header: t('LabelListPage.Color'),
      cell: ({ row }) => {
        return <span className="truncate">{row.original.color}</span>;
      },
    },
  ];

  const labelsData = useMemo<label_fragment$data[]>(
    () =>
      data.labels?.edges?.map?.(({ node }) =>
        readInlineData<label_fragment$key>(labelFragment, node)
      ) as label_fragment$data[],
    [data]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={labelsData}
        i18nKey={i18nKey(t)}
        tableOptions={{
          enableSorting: false,
          enableColumnResizing: false,
          enableColumnPinning: false,
          enableHiding: false,
        }}
        onClickRow={({ original }) =>
          setLabelEdit(original as label_fragment$data)
        }
        toolbar={
          <div className="flex flex-col-reverse items-center justify-between gap-s sm:flex-row">
            <div />
            <div className="flex w-full items-center justify-between gap-s sm:w-auto">
              <AddLabel connectionId={data!.labels!.__id} />
            </div>
          </div>
        }
      />
      {labelEdit && (
        <EditLabel
          label={labelEdit}
          open={!!labelEdit}
          connections={[data!.labels!.__id]}
          onClose={() =>
            useExecuteAfterAnimation(() => setLabelEdit(undefined))
          }
        />
      )}
    </>
  );
};

export default Labels;
