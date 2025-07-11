import { AdminUserUpdateForm } from '@/components/admin/user/admin-user-update-form';
import { UserUpdateForm } from '@/components/admin/user/user-update-form';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useAdminPath from '@/hooks/useAdminPath';
import { userList_fragment$data } from '@generated/userList_fragment.graphql';
import { useTranslations } from 'next-intl';
import { FunctionComponent, ReactNode, useState } from 'react';

interface EditUserProps {
  user: userList_fragment$data;
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
  const isAdminPath = useAdminPath();
  const [openSheet, setOpenSheet] = useState(defaultStateOpen ?? false);
  const t = useTranslations();

  const handleOpenSheet = (open: boolean) => {
    setOpenSheet((prevState) => {
      const sheetIsClosing = prevState !== open && !open;
      if (sheetIsClosing && onCloseSheet) {
        onCloseSheet();
      }
      return open;
    });
  };

  return (
    <SheetWithPreventingDialog
      title={t('UserActions.UpdateUser', { email: user.email })}
      open={openSheet}
      setOpen={handleOpenSheet}
      trigger={trigger}>
      {isAdminPath ? (
        <AdminUserUpdateForm
          user={user}
          callback={() => handleOpenSheet(false)}
        />
      ) : (
        <UserUpdateForm
          user={user}
          callback={() => handleOpenSheet(false)}
        />
      )}
    </SheetWithPreventingDialog>
  );
};
