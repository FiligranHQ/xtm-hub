import UseCaseForm, {
  UseCaseFormModel,
} from '@/components/admin/use-case/UseCaseForm';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { toast } from '@filigran/ui';
import {
  OrderingMode,
  UseCaseOrdering,
  useUseCaseDeleteMutation,
  useUseCaseEditMutation,
  useUseCasesListQuery,
} from '@graphql/generated';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [openSheet, setOpenSheet] = useState<boolean>(open);

  const { mutate: editUseCase } = useUseCaseEditMutation(portalGraphqlClient, {
    onSuccess: () => {
      toast({
        title: t('Utils.Success'),
      });
      queryClient.invalidateQueries({
        queryKey: useUseCasesListQuery.getKey({
          count: 100,
          orderMode: OrderingMode.Asc,
          orderBy: UseCaseOrdering.Name,
        }),
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

  const { mutate: deleteUseCase } = useUseCaseDeleteMutation(
    portalGraphqlClient,
    {
      onSuccess: () => {
        toast({
          title: t('Utils.Success'),
        });
        queryClient.invalidateQueries({
          queryKey: useUseCasesListQuery.getKey({
            count: 100,
            orderMode: OrderingMode.Asc,
            orderBy: UseCaseOrdering.Name,
          }),
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
    }
  );

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
