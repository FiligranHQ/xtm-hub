import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { useMutation } from 'react-relay';
import { organizationCreateMutation } from '../../../__generated__/organizationCreateMutation.graphql';
import { CreateOrganizationMutation } from '@/components/organization/organization.graphql';
import { OrganizationFormSheet } from '@/components/organization/organization-form-sheet';
import { AddIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
import { z } from 'zod';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { useToast } from 'filigran-ui/clients';
import TriggerButton from '@/components/ui/trigger-button';

interface CreateOrganizationProps {
  connectionId: string;
}

export const CreateOrganization: FunctionComponent<CreateOrganizationProps> = ({
  connectionId,
}) => {
  const { toast } = useToast();
  const [commitOrganizationCreationMutation] =
    useMutation<organizationCreateMutation>(CreateOrganizationMutation);
  const [openSheet, setOpenSheet] = useState(false);

  const handleSubmit = (values: z.infer<typeof organizationFormSchema>) => {
    commitOrganizationCreationMutation({
      variables: {
        connections: [connectionId],
        ...values,
      },

      onCompleted: ({ addOrganization }) => {
        if (!addOrganization) {
          return;
        }
        setOpenSheet(false);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });
  };
  return (
    <OrganizationFormSheet
      open={openSheet}
      setOpen={setOpenSheet}
      trigger={<TriggerButton label="Create organization" />}
      title={'Create a new organization'}
      description={
        'Create the organization here. Click on Validate when you are done.'
      }
      handleSubmit={handleSubmit}
    />
  );
};
