import { userDeletion } from '@/components/admin/user/user.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import {
  IconActionContext,
  IconActionsButton,
} from '@/components/ui/icon-actions';
import { useToast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import { FunctionComponent, ReactNode, useContext } from 'react';
import { useMutation } from 'react-relay';
import { userDeletionMutation } from '../../../../__generated__/userDeletionMutation.graphql';

interface DeleteUserActionsProps {
  user: {
    id: string;
    email: string;
  };
  trigger?: ReactNode;
  connectionID: string;
}

export const DeleteUserAction: FunctionComponent<DeleteUserActionsProps> = ({
  user,
  trigger,
  connectionID,
}) => {
  const { setMenuOpen } = useContext(IconActionContext);
  const { toast } = useToast();
  const t = useTranslations();
  const [deleteUserMutation] = useMutation<userDeletionMutation>(userDeletion);
  const onDeleteUser = (id: string): void => {
    setMenuOpen(false);
    deleteUserMutation({
      variables: { id, connections: [connectionID] },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: t('UserActions.UserDeleted'),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{error.message}</>,
        });
      },
    });
  };

  const defaultTrigger = (
    <IconActionsButton aria-label={t('UserActions.DeleteUser')}>
      {t('MenuActions.Delete')}
    </IconActionsButton>
  );

  return (
    <AlertDialogComponent
      AlertTitle={t('UserActions.DeleteUser')}
      actionButtonText={t('MenuActions.Delete')}
      variantName={'destructive'}
      triggerElement={trigger ?? defaultTrigger}
      onClickContinue={() => onDeleteUser(user.id)}>
      {t('DeleteUserDialog.TextDeleteThisUser', {
        email: user.email,
      })}
    </AlertDialogComponent>
  );
};
