import { CapabilityDescription } from '@/components/admin/user/capability-description';
import { userFormSchema } from '@/components/admin/user/user-form.schema';
import { SettingsContext } from '@/components/settings/env-portal-context';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { isEmpty } from '@/lib/utils';
import { buildOrganizationCapabilitiesMultiSelectOptions } from '@/utils/constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  MultiSelectFormField,
  SheetFooter,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { z, ZodSchema } from 'zod';

interface UserFormProps {
  handleSubmit: (values: z.infer<typeof userFormSchema>) => void;
  validationSchema: ZodSchema;
}
export const UserForm: FunctionComponent<UserFormProps> = ({
  handleSubmit,
  validationSchema,
}) => {
  const { handleCloseSheet, setIsDirty } = useDialogContext();

  const { settings } = useContext(SettingsContext);

  const t = useTranslations();

  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      password: '',
      roles_id: [],
      organizations: [],
    },
  });

  // Some issue with addUser, the formState isDirty without any modification, so for now we check if dirtyFields get any key
  setIsDirty(!isEmpty(form.formState.dirtyFields));

  const onSubmit = (values: z.infer<typeof validationSchema>) => {
    handleSubmit({
      ...values,
    });
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-xl">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('UserForm.Email')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('UserForm.Email')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <CapabilityDescription />
        <FormField
          control={form.control}
          name="capabilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('UserForm.OrganizationCapabilities')}</FormLabel>
              <FormControl>
                <MultiSelectFormField
                  noResultString={t('Utils.NotFound')}
                  options={buildOrganizationCapabilitiesMultiSelectOptions(
                    settings
                  )}
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder={t(
                    'UserForm.OrganizationsCapabilitiesPlaceholder'
                  )}
                  variant="inverted"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SheetFooter className="pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={(e) => handleCloseSheet(e)}>
            {t('Utils.Cancel')}
          </Button>
          <Button
            disabled={!form.formState.isDirty}
            type="submit">
            {t('Utils.Validate')}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
};
