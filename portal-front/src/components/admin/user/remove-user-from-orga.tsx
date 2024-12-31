import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import {
  IconActionContext,
  IconActionsButton,
} from '@/components/ui/icon-actions';
import { useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, ReactNode, useContext } from 'react';
import { graphql, useMutation } from 'react-relay';
import { removeUserFromOrgaMutation } from '../../../../__generated__/removeUserFromOrgaMutation.graphql';

interface RemoveUserFromOrgaProps {
  user: {
    id: string;
    email: string;
  };
  organization_id: string;
  trigger?: ReactNode;
  connectionID: string;
}

const removeUser = graphql`
  mutation removeUserFromOrgaMutation(
    $connections: [ID!]!
    $user_id: ID!
    $organization_id: ID!
  ) {
    removeUserFromOrganization(
      user_id: $user_id
      organization_id: $organization_id
    ) {
      id @deleteEdge(connections: $connections)
      ...userList_fragment
    }
  }
`;

export const RemoveUserFromOrga: FunctionComponent<RemoveUserFromOrgaProps> = ({
  user,
  organization_id,
  trigger,
  connectionID,
}) => {
  const { setMenuOpen } = useContext(IconActionContext);
  const { toast } = useToast();
  const t = useTranslations();
  const [removeUserMutation] =
    useMutation<removeUserFromOrgaMutation>(removeUser);
  const onRemoveUser = (user_id: string): void => {
    setMenuOpen(false);
    removeUserMutation({
      variables: { user_id, organization_id, connections: [connectionID] },
      onError: () => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t('Error.User.RemoveFromOrganization'),
        });
      },
    });
  };

  const defaultTrigger = (
    <IconActionsButton
      className="normal-case"
      aria-label={t('UserActions.RemoveUser')}>
      {t('MenuActions.Remove')}
    </IconActionsButton>
  );

  return (
    <AlertDialogComponent
      AlertTitle={t('UserActions.RemoveUser')}
      actionButtonText={t('MenuActions.Remove')}
      variantName={'destructive'}
      triggerElement={trigger ?? defaultTrigger}
      onClickContinue={() => onRemoveUser(user.id)}>
      {t('RemoveUserOrgDialog.TextRemoveThisUser', {
        email: user.email,
      })}
    </AlertDialogComponent>
  );
};
