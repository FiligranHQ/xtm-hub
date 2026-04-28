import { UserList_fragment$data } from '@generated/UserList_fragment.graphql';
import { useTranslations } from 'next-intl';
import { FunctionComponent, ReactNode, useState } from 'react';
import useAdminPath from '../../../../hooks/use-admin-path';
import { SheetWithPreventingDialog } from '../../../ui/SheetWithPreventingDialog';
import { AdminUserUpdateForm } from './admin/AdminUserUpdateForm';
import { UserUpdateForm } from './UserUpdateForm';

interface EditUserProps {
  user: UserList_fragment$data;
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
