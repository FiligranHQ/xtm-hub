import { UserFormSheet } from '@/components/admin/user/user-form-sheet';
import { userEditFormSchema } from '@/components/admin/user/user-form.schema';
import { UserSlugEditMutation } from '@/components/admin/user/user.graphql';
import TriggerButton from '@/components/ui/trigger-button';
import { useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, ReactNode, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { userList_fragment$data } from '../../../../../__generated__/userList_fragment.graphql';
import { userSlugEditMutation } from '../../../../../__generated__/userSlugEditMutation.graphql';
import { userSlug_fragment$data } from '../../../../../__generated__/userSlug_fragment.graphql';

interface EditUserProps {
  user: userSlug_fragment$data | userList_fragment$data;
  trigger?: ReactNode;
}

export const EditUser: FunctionComponent<EditUserProps> = ({
  user,
  trigger,
}) => {
  const [openSheet, setOpenSheet] = useState(false);
  const t = useTranslations();

  const { toast } = useToast();
  const [commitUserMutation] =
    useMutation<userSlugEditMutation>(UserSlugEditMutation);

  const handleSubmit = (values: z.infer<typeof userEditFormSchema>) => {
    const { password, ...valuesWithoutPasswordField } = values;
    commitUserMutation({
      variables: { input: { ...valuesWithoutPasswordField }, id: user.id },
      onCompleted: () => {
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('UserActions.UserUpdated', { email: values.email }),
        });
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t('Error.User.EditUser'),
        });
      },
    });
  };

  const defaultTrigger = <TriggerButton label={t('Utils.Update')} />;
  return (
    <UserFormSheet
      title={t('UserActions.UpdateUser')}
      handleSubmit={handleSubmit}
      open={openSheet}
      setOpen={setOpenSheet}
      user={user}
      validationSchema={userEditFormSchema}
      trigger={trigger ?? defaultTrigger}
    />
  );
};
