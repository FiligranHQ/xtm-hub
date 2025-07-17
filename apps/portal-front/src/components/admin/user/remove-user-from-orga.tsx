import { UserListContext } from '@/components/admin/user/user-list';
import { PortalContext } from '@/components/me/app-portal-context';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { removeUserFromOrgaMutation } from '@generated/removeUserFromOrgaMutation.graphql';
import { userList_fragment$data } from '@generated/userList_fragment.graphql';
import { Button, useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';
import { graphql, useMutation } from 'react-relay';

interface RemoveUserFromOrgaProps {
  user: userList_fragment$data;
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
}) => {
  const { me } = useContext(PortalContext);
  const { connectionID } = useContext(UserListContext);
  const { setOpenSheet } = useDialogContext();
  const { toast } = useToast();
  const t = useTranslations();
  const [removeUserMutation] =
    useMutation<removeUserFromOrgaMutation>(removeUser);
  const onRemoveUser = (user_id: string): void => {
    removeUserMutation({
      variables: {
        user_id,
        organization_id: me!.selected_organization_id,
        connections: [connectionID ?? ''],
      },
      onCompleted: () => {
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('UserActions.UserRemoved', { email: user.email }),
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

  const trigger = (
    <Button variant="outline-destructive">{t('MenuActions.Remove')}</Button>
  );

  return (
    <AlertDialogComponent
      AlertTitle={t('UserActions.RemoveUser')}
      actionButtonText={t('MenuActions.Remove')}
      variantName={'destructive'}
      triggerElement={trigger}
      onClickContinue={() => onRemoveUser(user.id)}>
      {t('RemoveUserOrgDialog.TextRemoveThisUser', {
        email: user.email,
      })}
    </AlertDialogComponent>
  );
};
