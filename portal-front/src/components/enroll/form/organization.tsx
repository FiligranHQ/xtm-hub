import { organizationItem_fragment$data } from '@generated/organizationItem_fragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'filigran-ui/clients';
import { Button, Input } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Props {
  organizations: Omit<organizationItem_fragment$data, ' $fragmentType'>[];
  cancel: () => void;
  confirm: (organizationId: string) => void;
}

export const selectOrganizationSchema = z.object({
  organizationId: z.string().nonempty(),
});

export const EnrollOrganizationForm: React.FC<Props> = ({
  cancel,
  confirm,
  organizations,
}) => {
  const t = useTranslations();

  const form = useForm<z.infer<typeof selectOrganizationSchema>>({
    resolver: zodResolver(selectOrganizationSchema),
    defaultValues: {
      organizationId: organizations[0]?.id ?? '',
    },
  });

  return (
    <Form {...form}>
      <form className="flex flex-col h-full justify-between">
        <div className="flex flex-col">
          <h2>{t('Enroll.OCTI.OrganizationForm.Title')}</h2>
          <p>{t('Enroll.OCTI.OrganizationForm.Description')}</p>
          <FormField
            control={form.control}
            render={({ field }) => (
              <>
                {organizations.map((organization) => {
                  return (
                    <FormItem
                      key={organization.id}
                      className="flex justify-start gap-s items-center">
                      <FormControl>
                        <Input
                          className="w-auto mt-8px"
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
              </>
            )}
            name="organizationId"
          />
        </div>
        <div className="flex justify-end gap-s">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              cancel();
            }}>
            {t('Utils.Cancel')}
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              confirm(form.getValues().organizationId);
            }}>
            {t('Enroll.Register')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
