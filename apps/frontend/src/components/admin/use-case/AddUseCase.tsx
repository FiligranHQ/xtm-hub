import UseCaseForm from '@/components/admin/use-case/UseCaseForm';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { Button, toast } from '@filigran/ui';
import { useAddUseCase } from '@graphql/use-case/hooks/useAddUseCase';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const AddUseCase = () => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);

  const { mutate: createUseCase } = useAddUseCase({
    onSuccess: () => {
      setOpenSheet(false);
      toast({ title: t('Utils.Success') });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'UnknownError';
      toast({
        variant: 'destructive',
        title: t('Utils.Error'),
        description: <>{t(`Error.Server.${errorMessage}`)}</>,
      });
    },
  });

  return (
    <SheetWithPreventingDialog
      title={t('UseCaseActions.AddUseCase')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={<Button>{t('UseCaseActions.AddUseCase')}</Button>}>
      <UseCaseForm
        onClose={() => setOpenSheet(false)}
        handleSubmit={(input) => createUseCase({ input })}
      />
    </SheetWithPreventingDialog>
  );
};

export default AddUseCase;
