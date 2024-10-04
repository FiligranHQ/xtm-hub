import { OrganizationFormSheet } from '@/components/organization/organization-form-sheet';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { CreateOrganizationMutation } from '@/components/organization/organization.graphql';
import TriggerButton from '@/components/ui/trigger-button';
import { useToast } from 'filigran-ui/clients';
import { FunctionComponent, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { organizationCreateMutation } from '../../../__generated__/organizationCreateMutation.graphql';

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
      trigger={
        <TriggerButton
          className="truncate inline-block "
          label="Create organization"
        />
      }
      title={'Create a new organization'}
      handleSubmit={handleSubmit}
    />
  );
};
