import {
  userEditFormSchema,
  userFormSchema,
} from '@/components/admin/user/user-form.schema';
import { Portal, portalContext } from '@/components/me/portal-context';
import { getOrganizations } from '@/components/organization/organization.service';
import { getRolesPortal } from '@/components/role-portal/role-portal.service';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import useAdminPath from '@/hooks/useAdminPath';
import { isDevelopment } from '@/lib/utils';
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
import { meContext_fragment$data } from '../../../../__generated__/meContext_fragment.graphql';
import { userList_fragment$data } from '../../../../__generated__/userList_fragment.graphql';
import { userSlug_fragment$data } from '../../../../__generated__/userSlug_fragment.graphql';

const initializeOrganizations = (
  user:
    | meContext_fragment$data
    | userSlug_fragment$data
    | userList_fragment$data
    | null
    | undefined,
  me: meContext_fragment$data | null | undefined,
  isAdmin: boolean | undefined
) => {
  if (user) {
    // If updating a user, filter and map organizations
    return (user?.organizations ?? [])
      .filter((organizationData) => !organizationData.personal_space)
      .map((organizationData) => organizationData.id);
  } else {
    // If creating a user, include the selected organization unless the user is an admin
    return isAdmin ? [] : [me?.selected_organization_id];
  }
};

interface UserFormProps {
  user?:
    | meContext_fragment$data
    | userSlug_fragment$data
    | userList_fragment$data
    | null;
  handleSubmit: (
    values: z.infer<typeof userEditFormSchema> | z.infer<typeof userFormSchema>
  ) => void;
  validationSchema: ZodSchema;
}
export const UserForm: FunctionComponent<UserFormProps> = ({
  user,
  handleSubmit,
  validationSchema,
}) => {
  const { handleCloseSheet, setIsDirty } = useDialogContext();

  const t = useTranslations();
  const { me } = useContext<Portal>(portalContext);
  const currentRolesPortal = user?.roles_portal.map(
    (rolePortalData) => rolePortalData.id
  );
  // TODO Rework not a good implementation yet, should be easier when we will have a clear separation between user, role and org
  const personalSpace = (user?.organizations ?? [])?.find(
    (organizationData) => organizationData.personal_space
  );
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

  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...user,
      password: '',
      roles_id: currentRolesPortal ?? [],
      organizations: initOrganizations,
    },
  });
  setIsDirty(form.formState.isDirty);
  const onSubmit = (values: z.infer<typeof validationSchema>) => {
    handleSubmit({
      ...values,
      organizations: [
        ...values.organizations,
        ...(personalSpace ? [personalSpace.id] : []),
      ],
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
        {isDevelopment() && isAdminPath && (
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
