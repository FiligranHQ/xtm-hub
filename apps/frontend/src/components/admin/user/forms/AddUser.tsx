import { getUserListContext } from '@/components/admin/user/UserListPage';
import { UserForm } from '@/components/admin/user/forms/UserForm';
import { userFormSchema } from '@/components/admin/user/forms/user-form.schema';
import { UserListCreateMutation } from '@/components/admin/user/user.graphql';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { Button, useToast } from '@filigran/ui';
import { userListCreateMutation } from '@generated/userListCreateMutation.graphql';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
export const AddUser = () => {
  const { t } = useTranslate();
  const [openSheet, setOpenSheet] = useState(false);

  const { toast } = useToast();
  const [commitUserMutation] = useMutation<userListCreateMutation>(
    UserListCreateMutation
  );

  const { connectionID } = getUserListContext();
  const handleSubmit = (values: z.infer<typeof userFormSchema>) => {
    commitUserMutation({
      variables: {
        input: {
          ...values,
        },
        connections: [connectionID],
      },
      onCompleted: () => {
        setOpenSheet(false);
        toast({
          title: t('Utils_Success'),
          description: t('UserActions_UserCreated', { email: values.email }),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils_Error'),
          description: t(`Error_Server_${error.message}`),
        });
      },
    });
  };

  return (
    <SheetWithPreventingDialog
      title={t('UserActions_AddUser')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={<Button>{t('UserActions_AddUser')}</Button>}>
      <UserForm
        handleSubmit={handleSubmit}
        validationSchema={userFormSchema}
      />
    </SheetWithPreventingDialog>
  );
};
