import * as React from 'react';
import { FunctionComponent } from 'react';
import { useMutation } from 'react-relay';
import { organizationDeletion } from '@/components/organization/organization.graphql';
import { DeleteIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
import { organizationItem_fragment$data } from '../../../__generated__/organizationItem_fragment.graphql';
import { organizationDeletionMutation } from '../../../__generated__/organizationDeletionMutation.graphql';
import { useToast } from 'filigran-ui/clients';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';

interface DeleteOrganizationProps {
  organization: organizationItem_fragment$data;
  connectionId: string;
}

export const DeleteOrganization: FunctionComponent<DeleteOrganizationProps> = ({
  organization,
  connectionId,
}) => {
  const [deleteOrganizationMutation] =
    useMutation<organizationDeletionMutation>(organizationDeletion);

  const { toast } = useToast();
  const onDeletedOrganization = (deletedOrganizationId: string) => {
    deleteOrganizationMutation({
      variables: { id: deletedOrganizationId, connections: [connectionId] },

      onError: (error) => {
        const message = error.message.includes(
          'violates foreign key constraint "user_organization_id_foreign" on table "User"'
        )
          ? 'The organization could not be deleted because at least one user is affiliated with it. Delete the user(s) first. '
          : error.message;

        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{message}</>,
        });
      },
    });
  };
  return (
    <AlertDialogComponent
      actionButtonText={'Delete'}
      variantName={'destructive'}
      AlertTitle={'Delete organization'}
      triggerElement={
        <Button
          variant="ghost"
          className="w-full justify-start"
          aria-label="Delete Organization">
          Delete
        </Button>
      }
      onClickContinue={() => onDeletedOrganization(organization.id)}>
      Are you sure you want to delete this organization {organization.name}?
      This action can not be undone.
    </AlertDialogComponent>
  );
};
