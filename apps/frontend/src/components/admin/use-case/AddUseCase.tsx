import UseCaseForm from '@/components/admin/use-case/UseCaseForm';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { Button, toast } from '@filigran/ui';
import {
  OrderingMode,
  UseCaseOrdering,
  useUseCaseAddMutation,
  useUseCasesListQuery,
} from '@graphql/generated';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const AddUseCase = () => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);
  const queryClient = useQueryClient();
  const { mutate: createUseCase } = useUseCaseAddMutation(portalGraphqlClient, {
    onSuccess: () => {
      setOpenSheet(false);
      queryClient.invalidateQueries({
        queryKey: useUseCasesListQuery.getKey({
          count: 100,
          orderMode: OrderingMode.Asc,
          orderBy: UseCaseOrdering.Name,
        }),
      });
      toast({
        title: t('Utils.Success'),
      });
    },
    onError: (error: unknown) => {
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
