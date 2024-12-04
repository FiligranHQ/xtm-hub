import { UserFormSheet } from '@/components/admin/user/user-form-sheet';
import {
  userEditFormSchema,
  userFormSchema,
} from '@/components/admin/user/user-form.schema';
import { UserListCreateMutation } from '@/components/admin/user/user.graphql';
import TriggerButton from '@/components/ui/trigger-button';
import { useToast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { userListCreateMutation } from '../../../../__generated__/userListCreateMutation.graphql';

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

  const handleSubmit = (
    values: z.infer<typeof userFormSchema> | z.infer<typeof userEditFormSchema>
  ) => {
    commitUserMutation({
      variables: {
        input: { ...(values as z.infer<typeof userFormSchema>) },
        connections: [connectionId],
      },
      onCompleted: () => {
        setOpenSheet(false);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });
  };
  return (
    <UserFormSheet
      title={'Create a new user'}
      handleSubmit={handleSubmit}
      open={openSheet}
      setOpen={setOpenSheet}
      validationSchema={userFormSchema}
      user={undefined}
      trigger={<TriggerButton label={t('UserActions.addUser')} />}
    />
  );
};
