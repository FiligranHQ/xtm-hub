import { organizationListUserOrganizationsQuery$data } from '@generated/organizationListUserOrganizationsQuery.graphql';
import { AutoForm } from 'filigran-ui';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from 'filigran-ui/clients';
import { Button, Input } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React from 'react';
import { z } from 'zod';

interface Props {
  organizations: organizationListUserOrganizationsQuery$data['userOrganizations'];
  cancel: () => void;
  confirm: (organizationId: string) => void;
}

export const selectOrganizationFormSchema = z.object({
  organizationId: z.string().nonempty(),
});

export const EnrollOrganizationForm: React.FC<Props> = ({
  cancel,
  confirm,
  organizations,
}) => {
  const t = useTranslations();

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col justify-between gap-m">
        <div className="space-y-m">
          <h1>{t('Enroll.OCTI.OrganizationForm.Title')}</h1>
          <p>{t('Enroll.OCTI.OrganizationForm.Description')}</p>
        </div>
        <AutoForm
          formSchema={selectOrganizationFormSchema}
          values={{ organizationId: organizations[0]?.id ?? '' }}
          onSubmit={({ organizationId }) => {
            confirm(organizationId);
          }}
          fieldConfig={{
            organizationId: {
              fieldType: ({ field }) => (
                <div className="flex flex-col">
                  {organizations.map((organization) => {
                    return (
                      <FormItem
                        key={organization.id}
                        className="flex justify-start gap-xs items-center">
                        <FormControl>
                          <Input
                            className="w-auto accent-primary"
                            aria-labelledby={`enroll-form-organization-${organization.name}`}
                            type="radio"
                            onChange={() => {
                              field.onChange(organization.id);
                            }}
                            checked={field.value === organization.id}
                            value={organization.name}
                          />
                        </FormControl>

                        <FormLabel
                          id={`enroll-form-organization-${organization.name}`}
                          className="!mt-0">
                          {organization.name}
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    );
                  })}
                </div>
              ),
            },
          }}>
          <div className="flex justify-end gap-s">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                cancel();
              }}>
              {t('Utils.Cancel')}
            </Button>

            <Button type="submit">{t('Enroll.Confirm')}</Button>
          </div>
        </AutoForm>
      </div>
    </div>
  );
};
