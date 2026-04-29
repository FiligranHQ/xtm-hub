import { organizationDeletion } from '@/components/organization/organization.graphql';
import { useToast } from '@filigran/ui';
import { organizationDeletionMutation } from '@generated/organizationDeletionMutation.graphql';
import { organizationItem_fragment$data } from '@generated/organizationItem_fragment.graphql';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { useMutation } from 'react-relay';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';

interface DeleteOrganizationProps {
  organization: organizationItem_fragment$data;
  connectionId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const DeleteOrganization: FunctionComponent<DeleteOrganizationProps> = ({
  organization,
  connectionId,
  open,
  setOpen,
}) => {
  const [deleteOrganizationMutation] =
    useMutation<organizationDeletionMutation>(organizationDeletion);
  const t = useTranslations();
  const { toast } = useToast();
  const onDeletedOrganization = (deletedOrganizationId: string) => {
    deleteOrganizationMutation({
      variables: { id: deletedOrganizationId, connections: [connectionId] },
      onCompleted: () => {
        toast({
          title: t('Utils.Success'),
          description: t('OrganizationActions.OrganizationDeleted'),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{t(`Error.Server.${error.message}`)}</>,
        });
      },
    });
  };
  return (
    <AlertDialogComponent
      actionButtonText={t('Utils.Delete')}
      variantName={'destructive'}
      AlertTitle={t('OrganizationForm.DeleteOrganization')}
      isOpen={open}
      onOpenChange={setOpen}
      onClickContinue={() => onDeletedOrganization(organization.id)}>
      {t('OrganizationForm.SureDeleteOrganization', {
        organizationName: organization.name,
      })}
    </AlertDialogComponent>
  );
};
