import { OrganizationFormSheet } from '@/components/organization/organization-form-sheet';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { OrganizationEditMutation } from '@/components/organization/organization.graphql';
import { IconActionContext } from '@/components/ui/icon-actions';
import { Button, useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations();
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
        toast({
          title: t('Utils.Success'),
          description: t('OrganizationActions.OrganizationUpdated', {
            name: values.name,
          }),
        });
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t('Error.Organization.EditOrganization'),
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
          className="w-full justify-start normal-case"
          aria-label={t('OrganizationForm.EditOrganization')}>
          {t('Utils.Update')}
        </Button>
      }
      title={t('OrganizationForm.EditOrganization')}
      handleSubmit={handleSubmit}
    />
  );
};
