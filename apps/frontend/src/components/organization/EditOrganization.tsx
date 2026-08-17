import { OrganizationEditMutation } from '@/components/organization/organization.graphql';
import { OrganizationForm } from '@/components/organization/OrganizationForm';
import { organizationFormSchema } from '@/components/organization/OrganizationForm.schema';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { useToast } from '@filigran/ui';
import { organizationEditMutation } from '@generated/organizationEditMutation.graphql';
import { organizationItem_fragment$data } from '@generated/organizationItem_fragment.graphql';
import { useTranslate } from '@tolgee/react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
interface EditOrganizationProps {
  organization: organizationItem_fragment$data;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const EditOrganization = ({
  organization,
  open,
  setOpen,
}: EditOrganizationProps) => {
  const { t } = useTranslate();
  const { toast } = useToast();
  const [commitOrganizationEditionMutation] =
    useMutation<organizationEditMutation>(OrganizationEditMutation);

  const handleSubmit = (values: z.infer<typeof organizationFormSchema>) => {
    commitOrganizationEditionMutation({
      variables: {
        id: organization.id,
        input: {
          ...values,
        },
      },

      onCompleted: () => {
        setOpen(false);
        toast({
          title: t('Utils_Success'),
          description: t('OrganizationActions_OrganizationUpdated', {
            name: values.name,
          }),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils_Error'),
          description: t(`Error_Server_${error.message}`),
        });
      },
    });
  };
  return (
    <SheetWithPreventingDialog
      open={open}
      setOpen={setOpen}
      title={t('OrganizationForm_EditOrganization')}>
      <OrganizationForm
        organization={organization}
        handleSubmit={handleSubmit}
      />
    </SheetWithPreventingDialog>
  );
};
