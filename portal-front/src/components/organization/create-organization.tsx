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

interface CreateOrganizationProps {
  connectionId: string;
}

export const CreateOrganization: FunctionComponent<CreateOrganizationProps> = ({
  connectionId,
}) => {
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
      onError: () => {},
    });
  };
  return (
    <OrganizationFormSheet
      open={openSheet}
      setOpen={setOpenSheet}
      trigger={
        <Button
          size="icon"
          aria-label="Create Organization"
          className="absolute bottom-4 right-4 z-10 rounded-3xl drop-shadow-xl">
          <AddIcon className="h-4 w-4" />
        </Button>
      }
      title={'Create a new organization'}
      description={
        'Create the organization here. Click on Validate when you are done.'
      }
      handleSubmit={handleSubmit}
    />
  );
};
