import { organizationDeletion } from '@/components/organization/organization.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { Button, useToast } from 'filigran-ui';
import { UseTranslationsProps } from '@/i18n/config';
import { useToast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { useMutation } from 'react-relay';
import { organizationDeletionMutation } from '../../../__generated__/organizationDeletionMutation.graphql';
import { organizationItem_fragment$data } from '../../../__generated__/organizationItem_fragment.graphql';

interface DeleteOrganizationProps {
  organization: organizationItem_fragment$data;
  connectionId: string;
}

const getErrorMessage = (error: Error, t: UseTranslationsProps) => {
  const errorMessages = {
    USER_STILL_IN_ORGANIZATION: t('Error.Organization.StillReferencedWithUser'),
    SUBSCRIPTION_STILL_IN_ORGANIZATION: t(
      'Error.Organization.StillReferencedWithSubscription'
    ),
  };

  const errorKey = Object.keys(errorMessages).find((key) =>
    error.message.includes(key)
  );

  return errorKey
    ? errorMessages[errorKey as keyof typeof errorMessages]
    : t('Error.Organization.DeleteOrganization');
};

export const DeleteOrganization: FunctionComponent<DeleteOrganizationProps> = ({
  organization,
  connectionId,
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
        const message = getErrorMessage(error, t);

        console.log('message', message);
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{message}</>,
        });
      },
    });
  };
  return (
    <AlertDialogComponent
      actionButtonText={t('Utils.Delete')}
      variantName={'destructive'}
      AlertTitle={t('OrganizationForm.DeleteOrganization')}
      triggerElement={
        <Button
          variant="ghost"
          className="w-full justify-start normal-case"
          aria-label={t('OrganizationForm.DeleteOrganization')}>
          {t('Utils.Delete')}
        </Button>
      }
      onClickContinue={() => onDeletedOrganization(organization.id)}>
      {t('OrganizationForm.SureDeleteOrganization', {
        organizationName: organization.name,
      })}
    </AlertDialogComponent>
  );
};
