import LabelForm from '@/components/admin/label/label-form';
import { AddLabelMutation } from '@/components/admin/label/label.graphql';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useMutation } from 'react-relay';

const AddLabel = ({ connectionId }: { connectionId: string }) => {
  const t = useTranslations();
  const [createLabel] = useMutation(AddLabelMutation);
  const [openSheet, setOpenSheet] = useState(false);

  return (
    <SheetWithPreventingDialog
      title={t('LabelActions.AddLabel')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={<TriggerButton label={t('LabelActions.AddLabel')} />}>
      <LabelForm
        onClose={() => setOpenSheet(false)}
        handleSubmit={(input) =>
          createLabel({
            variables: {
              input,
              connections: [connectionId],
            },
            onCompleted: () => {
              setOpenSheet(false);
              toast({
                title: t('Utils.Success'),
              });
            },
            onError: (error) => {
              toast({
                variant: 'destructive',
                title: t('Utils.Error'),
                description: <>{t(`Error.Server.${error.message}`)}</>,
              });
            },
          })
        }
      />
    </SheetWithPreventingDialog>
  );
};

export default AddLabel;
