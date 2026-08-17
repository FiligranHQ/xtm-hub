import UseCaseForm from '@/components/admin/use-case/UseCaseForm';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { prependToQueryCache } from '@/utils/query-cache';
import { Button, toast } from '@filigran/ui';
import {
  UseCaseAddMutation,
  UseCasesListQuery,
  useUseCaseAddMutation,
} from '@graphql/generated';
import { useCaseListKeys } from '@graphql/use-case/use-case-list.keys';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
const AddUseCase = () => {
  const { t } = useTranslate();
  const [openSheet, setOpenSheet] = useState(false);
  const queryClient = useQueryClient();
  const { mutate: createUseCase } = useUseCaseAddMutation(portalGraphqlClient, {
    onSuccess: (data: UseCaseAddMutation) => {
      setOpenSheet(false);
      const newUseCase = data.addUseCase;
      if (newUseCase) {
        queryClient.setQueriesData<UseCasesListQuery>(
          { queryKey: useCaseListKeys.all() },
          prependToQueryCache('useCases', { node: newUseCase })
        );
      }
      toast({
        title: t('Utils_Success'),
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'UnknownError';
      toast({
        variant: 'destructive',
        title: t('Utils_Error'),
        description: <>{t(`Error_Server_${errorMessage}`)}</>,
      });
    },
  });

  return (
    <SheetWithPreventingDialog
      title={t('UseCaseActions_AddUseCase')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={<Button>{t('UseCaseActions_AddUseCase')}</Button>}>
      <UseCaseForm
        onClose={() => setOpenSheet(false)}
        handleSubmit={(input) => createUseCase({ input })}
      />
    </SheetWithPreventingDialog>
  );
};

export default AddUseCase;
