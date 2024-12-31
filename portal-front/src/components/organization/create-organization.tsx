import { OrganizationFormSheet } from '@/components/organization/organization-form-sheet';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { CreateOrganizationMutation } from '@/components/organization/organization.graphql';
import TriggerButton from '@/components/ui/trigger-button';
import { useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations();
  const { toast } = useToast();
  const [commitOrganizationCreationMutation] =
    useMutation<organizationCreateMutation>(CreateOrganizationMutation);
  const [openSheet, setOpenSheet] = useState(false);

  const handleSubmit = (values: z.infer<typeof organizationFormSchema>) => {
    commitOrganizationCreationMutation({
      variables: {
        connections: [connectionId],
        input: { ...values },
      },

      onCompleted: ({ addOrganization }) => {
        if (!addOrganization) {
          return;
        }
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('OrganizationActions.OrganizationCreated', {
            name: values.name,
          }),
        });
      },
      onError: (error) => {
        const message = error.message.includes(
          'duplicate key value violates unique constraint "organization_name_unique"'
        )
          ? t('OrganizationActions.ErrorNameAlreadyExists', {
              name: values.name,
            })
          : t('Error.Organization.CreateOrganization');
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{message}</>,
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
          label={t('OrganizationForm.CreateOrganization')}
        />
      }
      title={t('OrganizationForm.CreateOrganization')}
      handleSubmit={handleSubmit}
    />
  );
};
