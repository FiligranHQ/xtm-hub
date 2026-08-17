import { getUserListContext } from '@/components/admin/user/UserListPage';
import { PortalContext } from '@/components/me/AppPortalContext';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { useDialogContext } from '@/components/ui/SheetWithPreventingDialog';
import { Button, useToast } from '@filigran/ui';
import { RemoveUserFromOrgaMutation } from '@generated/RemoveUserFromOrgaMutation.graphql';
import { UserList_fragment$data } from '@generated/UserList_fragment.graphql';
import { useTranslate } from '@tolgee/react';
import { useContext } from 'react';
import { graphql, useMutation } from 'react-relay';
interface RemoveUserFromOrgaProps {
  user: UserList_fragment$data;
}

const removeUser = graphql`
  mutation RemoveUserFromOrgaMutation(
    $connections: [ID!]!
    $user_id: UserId!
    $organization_id: OrganizationId!
  ) {
    removeUserFromOrganization(
      user_id: $user_id
      organization_id: $organization_id
    ) {
      id @deleteEdge(connections: $connections)
      ...UserList_fragment
    }
  }
`;

export const RemoveUserFromOrga = ({ user }: RemoveUserFromOrgaProps) => {
  const { me } = useContext(PortalContext);
  const { connectionID } = getUserListContext();
  const { setOpenSheet } = useDialogContext();
  const { toast } = useToast();
  const { t } = useTranslate();
  const [removeUserMutation] =
    useMutation<RemoveUserFromOrgaMutation>(removeUser);
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
          title: t('Utils_Success'),
          description: t('UserActions_UserRemoved', { email: user.email }),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils_Error'),
          description: t(`Error_Server_${error.message}`),
        });
      },
    });
  };

  const trigger = (
    <Button variant="secondary-destructive">{t('MenuActions_Remove')}</Button>
  );

  return (
    <AlertDialogComponent
      AlertTitle={t('UserActions_RemoveUser')}
      actionButtonText={t('MenuActions_Remove')}
      variantName={'destructive'}
      triggerElement={trigger}
      onClickContinue={() => onRemoveUser(user.id)}>
      {t('RemoveUserOrgDialog_TextRemoveThisUser', {
        email: user.email,
      })}
    </AlertDialogComponent>
  );
};
