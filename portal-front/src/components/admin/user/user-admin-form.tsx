import { userAdminFormSchema } from '@/components/admin/user/user-form.schema';
import { getOrganizations } from '@/components/organization/organization.service';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { cn, isDevelopment, isEmpty } from '@/lib/utils';
import { ORGANIZATION_CAPACITY } from '@/utils/constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeleteIcon } from 'filigran-icon';
import { SelectValue } from 'filigran-ui';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Label,
  MultiSelectFormField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SheetFooter,
} from 'filigran-ui/clients';
import { Button, Input } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

interface UserAdminFormProps {
  handleSubmit: (values: z.infer<typeof userAdminFormSchema>) => void;
}
export const UserAdminForm: FunctionComponent<UserAdminFormProps> = ({
  handleSubmit,
}) => {
  const { handleCloseSheet, setIsDirty } = useDialogContext();

  const t = useTranslations();

  const [organizationsData] = getOrganizations();
  const organizations = organizationsData.organizations.edges;
  const organizationCapabilitiesData = [
    ORGANIZATION_CAPACITY.MANAGE_ACCESS,
    ORGANIZATION_CAPACITY.MANAGE_SUBSCRIPTION,
  ].map((capabilities) => ({
    label: capabilities,
    value: capabilities,
  }));

  const form = useForm<z.infer<typeof userAdminFormSchema>>({
    resolver: zodResolver(userAdminFormSchema),
    defaultValues: {
      password: '',
      organization_capabilities: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: 'organization_capabilities',
    control: form.control,
  });
  const isOrganizationAlreadySelected = (id: string) => {
    const orgCapabilities = form.getValues('organization_capabilities');

    return orgCapabilities.find(
      ({ organization_id }) => organization_id === id
    );
  };
  // Some issue with addUser, the formState isDirty without any modification, so for now we check if dirtyFields get any key
  setIsDirty(!isEmpty(form.formState.dirtyFields));

  const onSubmit = (values: z.infer<typeof userAdminFormSchema>) => {
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
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('UserForm.FirstName')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('UserForm.FirstName')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('UserForm.LastName')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('UserForm.LastName')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isDevelopment() && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('UserForm.Password')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('UserForm.Password')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex items-center gap-m">
          <Label>{t('UserForm.Organizations')}</Label>
          <Select
            onValueChange={(value) => {
              append({
                organization_id: value,
                capabilities: [],
              });
            }}
            value={''}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Add organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map(
                (organization) =>
                  !isOrganizationAlreadySelected(organization.node.id) && (
                    <SelectItem
                      key={organization.node.id}
                      value={organization.node.id}>
                      {organization.node.name}
                    </SelectItem>
                  )
              )}
            </SelectContent>
          </Select>
        </div>

        <div
          className={cn(
            '!mt-s px-l py-s',
            fields.length > 0 && 'bg-primary/10'
          )}>
          {fields.map((field, index) => {
            return (
              <FormField
                control={form.control}
                key={`organization_capabilities.${index}.capabilities`}
                name={`organization_capabilities.${index}.capabilities`}
                render={({ field: formField }) => {
                  return (
                    <FormItem>
                      <div className="grid gap-m items-center grid-cols-[1fr_4fr_3rem] pt-s">
                        <Label>
                          {
                            organizations.find(
                              (organization) =>
                                organization.node.id === field.organization_id
                            )?.node.name
                          }
                        </Label>
                        <FormControl>
                          <MultiSelectFormField
                            noResultString={t('Utils.NotFound')}
                            options={organizationCapabilitiesData}
                            defaultValue={formField.value}
                            onValueChange={formField.onChange}
                            placeholder={t(
                              'UserForm.OrganizationsCapabilitiesPlaceholder'
                            )}
                            variant="inverted"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}>
                          <DeleteIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            );
          })}
        </div>

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
