import {
  userEditFormSchema,
  userFormSchema,
} from '@/components/admin/user/user-form.schema';
import { getOrganizations } from '@/components/organization/organization.service';
import { Portal, portalContext } from '@/components/portal-context';
import { getRolesPortal } from '@/components/role-portal/role-portal.service';
import useAdminPath from '@/hooks/useAdminPath';
import { isDevelopment } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'filigran-ui/clients';
import { Button, Input, MultiSelectFormField } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { FunctionComponent, ReactNode, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { z, ZodSchema } from 'zod';
import { meContext_fragment$data } from '../../../../__generated__/meContext_fragment.graphql';
import { userList_fragment$data } from '../../../../__generated__/userList_fragment.graphql';
import { userSlug_fragment$data } from '../../../../__generated__/userSlug_fragment.graphql';

interface UserFormSheetProps {
  user?:
    | meContext_fragment$data
    | userSlug_fragment$data
    | userList_fragment$data
    | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  handleSubmit: (
    values: z.infer<typeof userEditFormSchema> | z.infer<typeof userFormSchema>
  ) => void;
  validationSchema: ZodSchema;
}

export const initializeOrganizations = (
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

export const UserFormSheet: FunctionComponent<UserFormSheetProps> = ({
  user,
  open,
  setOpen,
  trigger,
  title,
  handleSubmit,
  validationSchema,
}) => {
  const { me } = useContext<Portal>(portalContext);
  const t = useTranslations();
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
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader className="bg-page-background">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-xl">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
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
                  <FormLabel>Roles</FormLabel>
                  <FormControl>
                    <MultiSelectFormField
                      noResultString={t('Utils.NotFound')}
                      options={rolePortalData}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select roles"
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
                    <FormLabel>Organizations</FormLabel>
                    <FormControl>
                      <MultiSelectFormField
                        noResultString={t('Utils.NotFound')}
                        options={orgData}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select an organization"
                        variant="inverted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <SheetFooter className="pt-2">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button
                disabled={!form.formState.isDirty}
                type="submit">
                Validate
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
