import { RemoveUserFromOrga } from '@/components/admin/user/remove-user-from-orga';
import { userEditFormSchema } from '@/components/admin/user/user-form.schema';
import { UserSlugEditMutation } from '@/components/admin/user/user.graphql';
import { PortalContext } from '@/components/me/app-portal-context';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import useAdminPath from '@/hooks/useAdminPath';
import { isEmpty } from '@/lib/utils';
import { OrganizationCapabilityName } from '@/utils/constant';
import { userList_fragment$data } from '@generated/userList_fragment.graphql';
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
  toast,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { z } from 'zod';

interface UserUpdateFormProps {
  user: userList_fragment$data;
  callback: () => void;
}

export const UserUpdateForm: FunctionComponent<UserUpdateFormProps> = ({
  user,
  callback,
}) => {
  const { handleCloseSheet, setIsDirty } = useDialogContext();
  const { me } = useContext(PortalContext);
  const t = useTranslations();
  const isAdminPath = useAdminPath();

  const organizationCapabilitiesData = Object.values(
    OrganizationCapabilityName
  ).map((capability) => ({
    label: capability,
    value: capability,
  }));

  const userOrg = user.organization_capabilities?.find(
    (org) => org.organization.id === me?.selected_organization_id
  );
  const form = useForm<z.infer<typeof userEditFormSchema>>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      capabilities: [...(userOrg?.capabilities ?? [])],
    },
  });

  // Some issue with addUser, the formState isDirty without any modification, so for now we check if dirtyFields get any key
  setIsDirty(!isEmpty(form.formState.dirtyFields));

  const [updateUserMutation] = useMutation(UserSlugEditMutation);

  const updateUser = (values: z.infer<typeof userEditFormSchema>) => {
    const variables = isAdminPath
      ? values
      : { capabilities: values.capabilities };
    updateUserMutation({
      variables: {
        input: {
          ...variables,
        },
        id: user.id,
      },
      onCompleted: () => {
        toast({
          title: t('Utils.Success'),
          description: t('UserActions.UserUpdated', { email: user.email }),
        });
        callback();
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

  const onSubmit = (values: z.infer<typeof userEditFormSchema>) => {
    updateUser(values);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-xl">
        {isAdminPath && (
          <>
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
          </>
        )}
        <FormField
          control={form.control}
          name="capabilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('UserForm.OrganizationCapabilities')}</FormLabel>
              <FormControl>
                <MultiSelectFormField
                  noResultString={t('Utils.NotFound')}
                  options={organizationCapabilitiesData}
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

        <SheetFooter className="justify-between sm:justify-between pb-0">
          <RemoveUserFromOrga user={user} />
          <div className="flex gap-s">
            <Button
              variant="outline"
              type="button"
              onClick={(e) => handleCloseSheet(e)}>
              {t('Utils.Cancel')}
            </Button>
            <Button
              disabled={!form.formState.isValid}
              type="submit">
              {t('Utils.Validate')}
            </Button>
          </div>
        </SheetFooter>
      </form>
    </Form>
  );
};
