import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { useMutation } from 'react-relay';
import { OrganizationEditMutation } from '@/components/organization/organization.graphql';
import { OrganizationFormSheet } from '@/components/organization/organization-form-sheet';
import { EditIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
import { organizationItem_fragment$data } from '../../../__generated__/organizationItem_fragment.graphql';
import { organizationEditMutation } from '../../../__generated__/organizationEditMutation.graphql';
import { z } from 'zod';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { useToast } from 'filigran-ui/clients';

interface EditOrganizationProps {
  organization?: organizationItem_fragment$data;
  onClose: () => void;
}

export const EditOrganization: FunctionComponent<EditOrganizationProps> = ({
  organization,
  onClose,
}) => {
  const { toast } = useToast();
  const [commitOrganizationEditionMutation] =
    useMutation<organizationEditMutation>(OrganizationEditMutation);

  console.log(organization);
  const handleSubmit = (values: z.infer<typeof organizationFormSchema>) => {
    if (organization) {
      commitOrganizationEditionMutation({
        variables: {
          id: organization.id,
          input: {
            ...values,
          },
        },

        onCompleted: () => {
          onClose();
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: <>{error.message}</>,
          });
        },
      });
    }
  };
  return (
    <OrganizationFormSheet
      open={!!organization}
      setOpen={onClose}
      organization={organization}
      trigger={<></>}
      title={"Edit the organization's name"}
      description={
        "Edit the organization's name here. Click on Validate when you are done."
      }
      handleSubmit={handleSubmit}
    />
  );
};
