import { RegistrationContext } from '@/components/registration/context';
import { AutoForm } from '@filigran/ui';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@filigran/ui/clients';
import { Button, Input } from '@filigran/ui/servers';
import { organizationListUserOrganizationsQuery$data } from '@generated/organizationListUserOrganizationsQuery.graphql';
import { useTranslations } from 'next-intl';
import React, { useContext } from 'react';
import { z } from 'zod';

interface Props {
  userOrganizationsQueryData: organizationListUserOrganizationsQuery$data;
  cancel: () => void;
  confirm: (organizationId: string) => void;
}

export const selectOrganizationFormSchema = z.object({
  organizationId: z.string().nonempty(),
});

export const RegisterOrganizationForm: React.FC<Props> = ({
  cancel,
  confirm,
  userOrganizationsQueryData,
}) => {
  const organizations = userOrganizationsQueryData.userOrganizations;
  const { displayedIdentifier } = useContext(RegistrationContext);
  const t = useTranslations();

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col justify-between gap-m">
        <div className="space-y-m">
          <h1>
            {t(`Register.OrganizationForm.Title`, {
              platformIdentifier: displayedIdentifier,
            })}
          </h1>
          <p>{t(`Register.OrganizationForm.Description`)}</p>
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
                <div className="flex flex-col gap-2">
                  {organizations.map((organization) => {
                    return (
                      <FormItem
                        key={organization.id}
                        className="flex justify-start gap-xs items-center">
                        <FormControl>
                          <Input
                            className="w-auto h-4 w-4 accent-primary"
                            aria-labelledby={`register-form-organization-${organization.name}`}
                            type="radio"
                            onChange={() => {
                              field.onChange(organization.id);
                            }}
                            checked={field.value === organization.id}
                            value={organization.name}
                          />
                        </FormControl>

                        <FormLabel
                          id={`register-form-organization-${organization.name}`}
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

            <Button type="submit">{t('Register.Confirm')}</Button>
          </div>
        </AutoForm>
      </div>
    </div>
  );
};
