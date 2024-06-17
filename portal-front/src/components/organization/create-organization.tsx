import { FunctionComponent, useState } from 'react';
import { useMutation } from 'react-relay';
import {
  organizationCreateMutation,
  organizationCreateMutation$variables,
} from '../../../__generated__/organizationCreateMutation.graphql';
import { CreateOrganizationMutation } from '@/components/organization/organization.graphql';
import { OrganizationFormSheet } from '@/components/organization/organization-form-sheet';
import { AddIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
import * as React from 'react';

interface CreateOrganizationProps {
  connectionId: string;
}
export const CreateOrganization: FunctionComponent<CreateOrganizationProps> = ({
  connectionId,
}) => {
  const [commitOrganizationCreationMutation] =
    useMutation<organizationCreateMutation>(CreateOrganizationMutation);
  const [openSheet, setOpenSheet] = useState(false);

  const handleSubmit = (values: organizationCreateMutation$variables) => {
    commitOrganizationCreationMutation({
      variables: {
        connections: [connectionId],
        name: values.name,
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
      title={'title'}
      description={'Description'}
      handleSubmit={handleSubmit}
    />
  );
};
