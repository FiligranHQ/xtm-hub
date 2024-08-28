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
  organization: organizationItem_fragment$data;
}

export const EditOrganization: FunctionComponent<EditOrganizationProps> = ({
  organization,
}) => {
  const { toast } = useToast();
  const [commitOrganizationEditionMutation] =
    useMutation<organizationEditMutation>(OrganizationEditMutation);
  const [openSheet, setOpenSheet] = useState(false);

  const handleSubmit = (values: z.infer<typeof organizationFormSchema>) => {
    commitOrganizationEditionMutation({
      variables: {
        id: organization.id,
        input: {
          ...values,
        },
      },

      onCompleted: () => {
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
      organization={organization}
      trigger={
        <Button
          size="icon"
          variant="ghost"
          aria-label="Edit Organization">
          <EditIcon className="h-4 w-4" />
        </Button>
      }
      title={"Edit the organization's name"}
      description={
        "Edit the organization's name here. Click on Validate when you are done."
      }
      handleSubmit={handleSubmit}
    />
  );
};
