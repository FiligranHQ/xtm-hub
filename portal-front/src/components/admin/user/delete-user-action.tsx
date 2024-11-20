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
    first_name?: string | null;
    last_name?: string | null;
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
    <IconActionsButton aria-label={t('deleteUser')}>
      {t('delete')}
    </IconActionsButton>
  );

  return (
    <AlertDialogComponent
      AlertTitle={t('deleteUser')}
      actionButtonText={'Delete'}
      variantName={'destructive'}
      triggerElement={trigger ?? defaultTrigger}
      onClickContinue={() => onDeleteUser(user.id)}>
      {t('areYouSureYouWantToDeleteThisUser', {
        first_name: user.first_name,
        last_name: user.last_name,
      })}
    </AlertDialogComponent>
  );
};
