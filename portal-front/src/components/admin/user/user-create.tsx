import { UserForm } from '@/components/admin/user/user-form';
import { userFormSchema } from '@/components/admin/user/user-form.schema';
import { UserListCreateMutation } from '@/components/admin/user/user.graphql';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import { userListCreateMutation } from '@generated/userListCreateMutation.graphql';
import { useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';

interface CreateUserProps {
  connectionId: string;
}

export const AddUser: FunctionComponent<CreateUserProps> = ({
  connectionId,
}) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);

  const { toast } = useToast();
  const [commitUserMutation] = useMutation<userListCreateMutation>(
    UserListCreateMutation
  );

  const handleSubmit = (values: z.infer<typeof userFormSchema>) => {
    commitUserMutation({
      variables: {
        input: { ...(values as z.infer<typeof userFormSchema>) },
        connections: [connectionId],
      },
      onCompleted: () => {
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('UserActions.UserCreated', { email: values.email }),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  return (
    <SheetWithPreventingDialog
      title={t('UserActions.AddUser')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={<TriggerButton label={t('UserActions.AddUser')} />}>
      <UserForm
        handleSubmit={handleSubmit}
        validationSchema={userFormSchema}
      />
    </SheetWithPreventingDialog>
  );
};
