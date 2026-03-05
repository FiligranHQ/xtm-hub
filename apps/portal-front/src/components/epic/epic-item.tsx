'use client';
import { EpicFormSheet } from '@/components/epic/epic-form-sheet';
import { DeleteEpic } from '@/components/epic/epic-item/delete-epic';
import { EpicItemHeader } from '@/components/epic/epic-item/epic-item-header';
import { useEpicListContext } from '@/components/epic/epic-page';
import { IconActions, IconActionsItem } from '@/components/ui/icon-actions';
import { MoreVertIcon } from '@filigran/icon';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface EpicListProps {
  epic: epic_fragment$data;
  serviceInstanceId: string;
  userCanUpdate: boolean;
  userCanDelete: boolean;
}

export const EpicItem = ({
  epic,
  serviceInstanceId,
  userCanUpdate,
  userCanDelete,
}: EpicListProps) => {
  const { connectionID } = useEpicListContext();
  const t = useTranslations();

  const [deleteEpic, setDeleteEpic] = useState<epic_fragment$data | undefined>(
    undefined
  );
  const [updateEpic, setUpdateEpic] = useState<epic_fragment$data | undefined>(
    undefined
  );
  return (
    <li className="group overflow-hidden border-light flex flex-col relative rounded border hover:cursor-pointer bg-page-background h-[348px]">
      <div className="relative flex items-center justify-center w-full h-1/2 rounded bg-gradient-to-r from-darkblue to-blue-500">
        <EpicItemHeader
          epic={epic}
          serviceInstanceId={serviceInstanceId}
        />
        <span className="txt-title">{epic.epic}</span>
      </div>
      <div className="bg-page-background text-ellipsis overflow-hidden p-l group-hover:bg-hover w-full h-1/2">
        <h2 className="text-base md:text-lg font-semibold leading-tight min-w-0 p-m pr-xxl">
          {epic.title}
        </h2>
        <p className="p-m text-gray-300 text-sm">{epic.short_description}</p>
        <div className="flex items-center justify-end">
          {(userCanDelete || userCanUpdate) && (
            <IconActions
              icon={
                <>
                  <MoreVertIcon className="h-4 w-4 text-primary" />
                  <span className="sr-only">{'Utils.OpenMenu'}</span>
                </>
              }>
              {userCanUpdate && (
                <IconActionsItem onClick={() => setUpdateEpic(epic)}>
                  {t('Utils.Update')}
                </IconActionsItem>
              )}
              {userCanDelete && (
                <IconActionsItem onClick={() => setDeleteEpic(epic)}>
                  {t('Utils.Delete')}
                </IconActionsItem>
              )}
            </IconActions>
          )}
        </div>
      </div>
      {deleteEpic && (
        <DeleteEpic
          key={`delete-${deleteEpic.id}`}
          connectionId={connectionID}
          epic={deleteEpic}
          open={!!deleteEpic}
          setOpen={(open) => setDeleteEpic(open ? deleteEpic : undefined)}
        />
      )}
      {updateEpic && (
        <EpicFormSheet
          epic={updateEpic}
          open={!!updateEpic}
          setOpen={(open) => setUpdateEpic(open ? updateEpic : undefined)}
        />
      )}
    </li>
  );
};
