import { AddUseCaseMutation } from '@/components/admin/use-case/use-case.graphql';
import { Button, toast } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useMutation } from 'react-relay';
import { SheetWithPreventingDialog } from '../../ui/SheetWithPreventingDialog';
import UseCaseForm from './UseCaseForm';

const AddUseCase = ({ connectionId }: { connectionId: string }) => {
  const t = useTranslations();
  const [createUseCase] = useMutation(AddUseCaseMutation);
  const [openSheet, setOpenSheet] = useState(false);

  return (
    <SheetWithPreventingDialog
      title={t('UseCaseActions.AddUseCase')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={<Button>{t('UseCaseActions.AddUseCase')}</Button>}>
      <UseCaseForm
        onClose={() => setOpenSheet(false)}
        handleSubmit={(input) =>
          createUseCase({
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

export default AddUseCase;
