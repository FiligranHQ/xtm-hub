import { DeleteEpicMutation } from '@/components/epic/epic.graphql';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { useToast } from '@filigran/ui';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { epicDeleteMutation } from '@generated/epicDeleteMutation.graphql';
import { useTranslate } from '@tolgee/react';
import { useMutation } from 'react-relay';
interface DeleteEpicProps {
  epic: epic_fragment$data;
  connectionId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const DeleteEpic = ({
  epic,
  connectionId,
  open,
  setOpen,
}: DeleteEpicProps) => {
  const [deleteEpicMutation] =
    useMutation<epicDeleteMutation>(DeleteEpicMutation);
  const { t } = useTranslate();
  const { toast } = useToast();
  const onDeletedEpic = (deletedEpicId: string) => {
    deleteEpicMutation({
      variables: { id: deletedEpicId, connections: [connectionId] },
      onCompleted: () => {
        toast({
          title: t('Utils_Success'),
          description: t('Epic_EpicActions_EpicDeleted'),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils_Error'),
          description: <>{t(`Error_Server_${error.message}`)}</>,
        });
      },
    });
  };
  return (
    <AlertDialogComponent
      actionButtonText={t('Utils_Delete')}
      variantName={'destructive'}
      AlertTitle={t('Epic_EpicActions_DeleteEpic', { epicName: epic.title })}
      isOpen={open}
      onOpenChange={setOpen}
      onClickContinue={() => onDeletedEpic(epic.id)}>
      {t('Epic_EpicActions_SureDeleteEpic', { epicName: epic.title })}
    </AlertDialogComponent>
  );
};
