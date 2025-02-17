import LabelForm from '@/components/admin/label/label-form';
import { useMutation } from 'react-relay';
import { DeleteLabelMutation, EditLabelMutation } from '@/components/admin/label/label.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { useState } from 'react';
import { label_fragment$data } from '@generated/label_fragment.graphql';

const EditLabel = ({
  open,
  onClose,
  label,
  connections,
}: {
  open: boolean
  onClose: () => void
  label: label_fragment$data,
  connections: string[]
}) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState<boolean>(open);

  const [editLabel] = useMutation(EditLabelMutation);
  const [deleteLabel] = useMutation(DeleteLabelMutation);

  const handleOpenSheet = (open: boolean) => {
    setOpenSheet((prevState) => {
      const sheetIsClosing = prevState !== open && !open;
      if (sheetIsClosing && onClose) {
        onClose();
      }
      return open;
    });
  };

  return (
    <SheetWithPreventingDialog
      title={t('LabelActions.AddLabel')}
      setOpen={handleOpenSheet}
      open={openSheet}
    >
      <LabelForm
        label={label}
        onClose={() => handleOpenSheet(false)}
        handleDelete={() => deleteLabel({
          variables: {
            id: label.id,
            connections
          },
          onCompleted: () => {
            toast({
              title: t('Utils.Success'),
            });
            onClose();
          },
          onError: (error) => {
            toast({
              variant: 'destructive',
              title: t('Utils.Error'),
              description: <>{t(`Error.Server.${error.message}`)}</>,
            });
          },
        })}
        handleSubmit={(input) => editLabel({
          variables: {
            id: label.id,
            input,
          },
          onCompleted: () => {
            toast({
              title: t('Utils.Success'),
            });
            onClose();
          },
          onError: (error) => {
            toast({
              variant: 'destructive',
              title: t('Utils.Error'),
              description: <>{t(`Error.Server.${error.message}`)}</>,
            });
          },
        })}
      />
    </SheetWithPreventingDialog>
  )
};

export default EditLabel;