import { OrganizationEditMutation } from '@/components/organization/organization.graphql';
import { useToast } from '@filigran/ui';
import { organizationEditMutation } from '@generated/organizationEditMutation.graphql';
import { organizationItem_fragment$data } from '@generated/organizationItem_fragment.graphql';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { SheetWithPreventingDialog } from '../ui/SheetWithPreventingDialog';
import { OrganizationForm } from './OrganizationForm';
import { organizationFormSchema } from './OrganizationForm.schema';

interface EditOrganizationProps {
  organization: organizationItem_fragment$data;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const EditOrganization: FunctionComponent<EditOrganizationProps> = ({
  organization,
  open,
  setOpen,
}) => {
  const t = useTranslations();
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
          title: t('Utils.Success'),
          description: t('OrganizationActions.OrganizationUpdated', {
            name: values.name,
          }),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };
  return (
    <SheetWithPreventingDialog
      open={open}
      setOpen={setOpen}
      title={t('OrganizationForm.EditOrganization')}>
      <OrganizationForm
        organization={organization}
        handleSubmit={handleSubmit}
      />
    </SheetWithPreventingDialog>
  );
};
