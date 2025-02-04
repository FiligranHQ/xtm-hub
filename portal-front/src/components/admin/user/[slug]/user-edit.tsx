import { UserForm } from '@/components/admin/user/user-form';
import {
  userEditFormSchema,
  userFormSchema,
} from '@/components/admin/user/user-form.schema';
import { UserSlugEditMutation } from '@/components/admin/user/user.graphql';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { userList_fragment$data } from '@generated/userList_fragment.graphql';
import { userSlugEditMutation } from '@generated/userSlugEditMutation.graphql';
import { userSlug_fragment$data } from '@generated/userSlug_fragment.graphql';
import { useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, ReactNode, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';

interface EditUserProps {
  user?: userSlug_fragment$data | userList_fragment$data;
  trigger?: ReactNode;
  onCloseSheet?: () => void;
  defaultStateOpen?: boolean;
}

export const EditUser: FunctionComponent<EditUserProps> = ({
  user,
  trigger,
  onCloseSheet,
  defaultStateOpen = false,
}) => {
  const [openSheet, setOpenSheet] = useState(defaultStateOpen);
  const t = useTranslations();

  const { toast } = useToast();
  const [commitUserMutation] =
    useMutation<userSlugEditMutation>(UserSlugEditMutation);

  const handleOpenSheet = (open: boolean) => {
    setOpenSheet((prevState) => {
      const sheetIsClosing = prevState !== open && !open;
      if (sheetIsClosing && onCloseSheet) {
        onCloseSheet();
      }
      return open;
    });
  };

  const handleSubmit = (values: z.infer<typeof userEditFormSchema>) => {
    // Here we need everything except the password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...valuesWithoutPasswordField } = values;
    if (!user) {
      return;
    }
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

  return (
    <SheetWithPreventingDialog
      title={t('UserActions.UpdateUser')}
      open={openSheet}
      setOpen={handleOpenSheet}
      trigger={trigger}>
      <UserForm
        handleSubmit={handleSubmit}
        user={user}
        validationSchema={userFormSchema}
      />
    </SheetWithPreventingDialog>
  );
};
