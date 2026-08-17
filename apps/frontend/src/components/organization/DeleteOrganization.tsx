import { organizationDeletion } from '@/components/organization/organization.graphql';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { useToast } from '@filigran/ui';
import { organizationDeletionMutation } from '@generated/organizationDeletionMutation.graphql';
import { organizationItem_fragment$data } from '@generated/organizationItem_fragment.graphql';
import { useTranslate } from '@tolgee/react';
import { useMutation } from 'react-relay';
interface DeleteOrganizationProps {
  organization: organizationItem_fragment$data;
  connectionId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const DeleteOrganization = ({
  organization,
  connectionId,
  open,
  setOpen,
}: DeleteOrganizationProps) => {
  const [deleteOrganizationMutation] =
    useMutation<organizationDeletionMutation>(organizationDeletion);
  const { t } = useTranslate();
  const { toast } = useToast();
  const onDeletedOrganization = (deletedOrganizationId: string) => {
    deleteOrganizationMutation({
      variables: { id: deletedOrganizationId, connections: [connectionId] },
      onCompleted: () => {
        toast({
          title: t('Utils_Success'),
          description: t('OrganizationActions_OrganizationDeleted'),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils_Error'),
          description: <>{t(`Error_Server_${error.message}`)}</>,
        });
      },
    });
  };
  return (
    <AlertDialogComponent
      actionButtonText={t('Utils_Delete')}
      variantName={'destructive'}
      AlertTitle={t('OrganizationForm_DeleteOrganization')}
      isOpen={open}
      onOpenChange={setOpen}
      onClickContinue={() => onDeletedOrganization(organization.id)}>
      {t('OrganizationForm_SureDeleteOrganization', {
        organizationName: organization.name,
      })}
    </AlertDialogComponent>
  );
};
