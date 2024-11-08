import { OrganizationFormSheet } from '@/components/organization/organization-form-sheet';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { OrganizationEditMutation } from '@/components/organization/organization.graphql';
import { IconActionContext } from '@/components/ui/icon-actions';
import { useToast } from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { FunctionComponent, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { organizationEditMutation } from '../../../__generated__/organizationEditMutation.graphql';
import { organizationItem_fragment$data } from '../../../__generated__/organizationItem_fragment.graphql';

interface EditOrganizationProps {
  organization: organizationItem_fragment$data;
}

export const EditOrganization: FunctionComponent<EditOrganizationProps> = ({
  organization,
}) => {
  const { toast } = useToast();
  const [commitOrganizationEditionMutation] =
    useMutation<organizationEditMutation>(OrganizationEditMutation);
  const [openSheet, setOpenSheet] = useState<boolean | null>(null);
  const { setMenuOpen } = useContext(IconActionContext);

  useEffect(() => {
    if (!openSheet && openSheet !== null) setMenuOpen(false);
  }, [openSheet]);

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
      open={openSheet ?? false}
      setOpen={setOpenSheet}
      organization={organization}
      trigger={
        <Button
          variant="ghost"
          className="w-full justify-start"
          aria-label="Edit Organization">
          Edit
        </Button>
      }
      title={"Edit the organization's name"}
      handleSubmit={handleSubmit}
    />
  );
};
