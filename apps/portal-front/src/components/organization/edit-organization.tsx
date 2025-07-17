import { OrganizationForm } from '@/components/organization/organization-form';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { OrganizationEditMutation } from '@/components/organization/organization.graphql';
import { IconActionContext } from '@/components/ui/icon-actions';
import { organizationEditMutation } from '@generated/organizationEditMutation.graphql';
import { organizationItem_fragment$data } from '@generated/organizationItem_fragment.graphql';
import { useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { SheetWithPreventingDialog } from '../ui/sheet-with-preventing-dialog';

interface EditOrganizationProps {
  organization: organizationItem_fragment$data;
}

export const EditOrganization: FunctionComponent<EditOrganizationProps> = ({
  organization,
}) => {
  const t = useTranslations();
  const { toast } = useToast();
  const [commitOrganizationEditionMutation] =
    useMutation<organizationEditMutation>(OrganizationEditMutation);
  const [openSheet, setOpenSheet] = useState<boolean | null>(!!organization);
  const { setMenuOpen } = useContext(IconActionContext);

  useEffect(() => {
    if (!openSheet && openSheet !== null) setMenuOpen(false);
  }, [openSheet, setMenuOpen]);

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
      open={openSheet ?? false}
      setOpen={setOpenSheet}
      title={t('OrganizationForm.EditOrganization')}>
      <OrganizationForm
        organization={organization}
        handleSubmit={handleSubmit}
      />
    </SheetWithPreventingDialog>
  );
};
