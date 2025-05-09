import { OrganizationForm } from '@/components/organization/organization-form';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { CreateOrganizationMutation } from '@/components/organization/organization.graphql';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { organizationCreateMutation } from '@generated/organizationCreateMutation.graphql';
import { Button, useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';

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
        const message =
          error.message === 'ORGANIZATION_SAME_NAME_EXISTS'
            ? t('OrganizationActions.ErrorNameAlreadyExists', {
                name: values.name,
              })
            : error.message;
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{message}</>,
        });
      },
    });
  };
  return (
    <SheetWithPreventingDialog
      open={openSheet}
      setOpen={setOpenSheet}
      trigger={
        <Button className="truncate inline-block ">
          {t('OrganizationForm.CreateOrganization')}
        </Button>
      }
      title={t('OrganizationForm.CreateOrganization')}>
      <OrganizationForm handleSubmit={handleSubmit} />
    </SheetWithPreventingDialog>
  );
};
