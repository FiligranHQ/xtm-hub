import {
  DeleteUseCaseMutation,
  EditUseCaseMutation,
} from '@/components/admin/use-case/use-case.graphql';
import { toast } from '@filigran/ui';
import { useCase_fragment$data } from '@generated/useCase_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useMutation } from 'react-relay';
import { SheetWithPreventingDialog } from '../../ui/SheetWithPreventingDialog';
import UseCaseForm from './UseCaseForm';

const EditUseCase = ({
  open,
  onClose,
  useCase,
  connections,
}: {
  open: boolean;
  onClose: () => void;
  useCase: useCase_fragment$data;
  connections: string[];
}) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState<boolean>(open);

  const [editUseCase] = useMutation(EditUseCaseMutation);
  const [deleteUseCase] = useMutation(DeleteUseCaseMutation);

  const handleOpenSheet = (open: boolean) => {
    setOpenSheet((prevState) => {
      const sheetIsClosing = prevState !== open && !open;
      if (sheetIsClosing && onClose) {
        onClose();
      }
      return open;
    });
  };

  const onDeleteUseCase = () => {
    deleteUseCase({
      variables: {
        id: useCase.id,
        connections,
      },
      onCompleted: () => {
        toast({
          title: t('Utils.Success'),
        });
        handleOpenSheet(false);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{t(`Error.Server.${error.message}`)}</>,
        });
      },
    });
  };

  const onUpdateUseCase = (input: { name: string; color: string }) => {
    editUseCase({
      variables: {
        id: useCase.id,
        input,
      },
      onCompleted: () => {
        toast({
          title: t('Utils.Success'),
        });
        handleOpenSheet(false);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{t(`Error.Server.${error.message}`)}</>,
        });
      },
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
