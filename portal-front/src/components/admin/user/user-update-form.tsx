import { initializeOrganizations } from '@/components/admin/user/user-form';
import { userEditFormSchema } from '@/components/admin/user/user-form.schema';
import { UserSlugEditMutation } from '@/components/admin/user/user.graphql';
import { Portal, portalContext } from '@/components/me/portal-context';
import { getOrganizations } from '@/components/organization/organization.service';
import { getRolesPortal } from '@/components/role-portal/role-portal.service';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import useAdminPath from '@/hooks/useAdminPath';
import { isEmpty } from '@/lib/utils';
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

  const t = useTranslations();

  const personalSpace = (user?.organizations ?? [])?.find(
    (organizationData) => organizationData.personal_space
  );
  const { me } = useContext<Portal>(portalContext);
  const rolePortal = getRolesPortal();
  const isAdminPath = useAdminPath();
  const initOrganizations = initializeOrganizations(user, me, isAdminPath);

  const rolePortalData = rolePortal?.rolesPortal
    ?.map(({ name, id }) => ({
      label: name,
      value: id,
    }))
    .filter(({ label }) => !(!isAdminPath && ['ADMIN'].includes(label)));

  const [organizationData] = getOrganizations();

  const orgData = organizationData.organizations.edges.map(({ node }) => ({
    label: node.name,
    value: node.id,
  }));

  const currentRolesPortal = user?.roles_portal
    .map((rolePortalData) => rolePortalData.id)
    .filter((id) => rolePortalData.some((r) => r.value === id));

  const form = useForm<z.infer<typeof userEditFormSchema>>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      roles_id: currentRolesPortal,
      organizations: initOrganizations,
    },
  });

  // Some issue with addUser, the formState isDirty without any modification, so for now we check if dirtyFields get any key
  setIsDirty(!isEmpty(form.formState.dirtyFields));

  const [updateUserMutation] = useMutation(UserSlugEditMutation);

  const updateUser = (
    values: z.infer<typeof userEditFormSchema> | { disabled: boolean }
  ) => {
    const input = values;
    if ((values as z.infer<typeof userEditFormSchema>)?.organizations) {
      (values as z.infer<typeof userEditFormSchema>).organizations = [
        ...(values as z.infer<typeof userEditFormSchema>).organizations,
        ...(personalSpace ? [personalSpace.id] : []),
      ];
    }
    updateUserMutation({
      variables: {
        input,
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
        <FormField
          control={form.control}
          name="roles_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('UserForm.Roles')}</FormLabel>
              <FormControl>
                <MultiSelectFormField
                  noResultString={t('Utils.NotFound')}
                  options={rolePortalData}
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('UserForm.RolesPlaceholder')}
                  variant="inverted"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {isAdminPath && (
          <FormField
            control={form.control}
            name="organizations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('UserForm.Organizations')}</FormLabel>
                <FormControl>
                  <MultiSelectFormField
                    noResultString={t('Utils.NotFound')}
                    options={orgData}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('UserForm.OrganizationsPlaceholder')}
                    variant="inverted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <SheetFooter className="justify-between sm:justify-between pb-0">
          {user.disabled ? (
            <Button
              variant="outline-primary"
              onClick={() => updateUser({ disabled: false })}>
              {t('UserActions.Enable')}
            </Button>
          ) : (
            <AlertDialogComponent
              AlertTitle={t('MenuActions.Disable')}
              actionButtonText={t('MenuActions.Disable')}
              variantName={'destructive'}
              triggerElement={
                <Button variant="outline-destructive">
                  {t('UserActions.Disable')}
                </Button>
              }
              onClickContinue={() => updateUser({ disabled: true })}>
              {t('DisableUserDialog.TextDisableThisUser', {
                email: user.email,
              })}
            </AlertDialogComponent>
          )}
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
