import { UserForm } from '@/components/admin/user/user-form';
import {
  userEditFormSchema,
  userFormSchema,
} from '@/components/admin/user/user-form.schema';
import { UserSlugEditMutation } from '@/components/admin/user/user.graphql';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
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
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  const defaultTrigger = <TriggerButton label={t('Utils.Update')} />;
  return (
    <SheetWithPreventingDialog
      title={t('UserActions.UpdateUser')}
      open={openSheet}
      setOpen={setOpenSheet}
      trigger={trigger ?? defaultTrigger}>
      <UserForm
        handleSubmit={handleSubmit}
        user={user}
        validationSchema={userFormSchema}
      />
    </SheetWithPreventingDialog>
  );
};
