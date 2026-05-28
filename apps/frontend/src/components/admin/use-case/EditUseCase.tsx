import UseCaseForm, {
  UseCaseFormModel,
} from '@/components/admin/use-case/UseCaseForm';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { toast } from '@filigran/ui';
import { useEditUseCase } from '@graphql/use-case/hooks/useEditUseCase';
import { useDeleteUseCase } from '@graphql/use-case/hooks/useDeleteUseCase';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const EditUseCase = ({
  open,
  onClose,
  useCase,
}: {
  open: boolean;
  onClose: () => void;
  useCase: UseCaseFormModel;
}) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState<boolean>(open);

  const handleOpenSheet = (open: boolean) => {
    setOpenSheet((prevState) => {
      const sheetIsClosing = prevState !== open && !open;
      if (sheetIsClosing && onClose) {
        onClose();
      }
      return open;
    });
  };

  const { mutate: editUseCase } = useEditUseCase({
    onSuccess: () => {
      toast({
        title: t('Utils.Success'),
      });
      handleOpenSheet(false);
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

  const { mutate: deleteUseCase } = useDeleteUseCase({
    onSuccess: () => {
      toast({
        title: t('Utils.Success'),
      });
      handleOpenSheet(false);
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

  const onDeleteUseCase = () => {
    deleteUseCase({
      id: useCase.id,
    });
  };

  const onUpdateUseCase = (input: { name: string; color: string }) => {
    editUseCase({
      id: useCase.id,
      input,
    });
  };

  return (
    <SheetWithPreventingDialog
      title={t('UseCaseActions.AddUseCase')}
      setOpen={handleOpenSheet}
      open={openSheet}>
      <UseCaseForm
        useCase={useCase}
        onClose={() => handleOpenSheet(false)}
        handleDelete={onDeleteUseCase}
        handleSubmit={onUpdateUseCase}
      />
    </SheetWithPreventingDialog>
  );
};

export default EditUseCase;
