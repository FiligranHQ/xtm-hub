import { EpicFormSheet } from '@/components/epic/epic-form-sheet';
import { DeleteEpic } from '@/components/epic/epic-item/delete-epic';
import { EpicItemHeader } from '@/components/epic/epic-item/epic-item-header';
import { IconActions, IconActionsItem } from '@/components/ui/icon-actions';
import { useEpicListContext } from '@/hooks/useEpicListContext';
import { MoreVertIcon } from '@filigran/icon';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@filigran/ui';

interface EpicItemCardProps {
  epic: epic_fragment$data;
  serviceInstanceId: string;
  setIsOpen: (open: boolean) => void;
  userCanDelete: boolean;
  userCanUpdate: boolean;
}

export const EpicItemCard = ({
  epic,
  serviceInstanceId,
  setIsOpen,
  userCanDelete,
  userCanUpdate,
}: EpicItemCardProps) => {
  const t = useTranslations();
  const { connectionID } = useEpicListContext();

  const [deleteEpic, setDeleteEpic] = useState<epic_fragment$data | undefined>(
    undefined
  );
  const [updateEpic, setUpdateEpic] = useState<epic_fragment$data | undefined>(
    undefined
  );
  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="relative flex items-center justify-center w-full h-2/5 rounded bg-gradient-to-r from-darkblue to-blue-500">
        <EpicItemHeader
          epic={epic}
          serviceInstanceId={serviceInstanceId}
        />
        <span className="txt-title">{epic.epic}</span>
      </div>
      <div
        onClick={() => setIsOpen(true)}
        className="flex flex-col flex-1 bg-page-background text-ellipsis overflow-hidden p-l group-hover:bg-hover w-full">
        <h2 className="text-base md:text-lg font-semibold leading-tight min-w-0 p-m pr-xxl overflow-hidden">
          {epic.title}
        </h2>
        <p className="p-m text-gray-300 text-sm overflow-hidden">
          {epic.short_description}
        </p>
        <div
          className="flex items-center justify-end mt-auto"
          onClick={(e) => {
            e.stopPropagation();
          }}>
          {!epic.active && (
            <Badge
              variant="warning"
              className="font-semibold">
              {t('Epic.Timeline.draft')}
            </Badge>
          )}
          {(userCanDelete || userCanUpdate) && (
            <IconActions
              icon={
                <>
                  <MoreVertIcon className="h-4 w-4 text-primary" />
                  <span className="sr-only">{t('Utils.OpenMenu')}</span>
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
    </>
  );
};
