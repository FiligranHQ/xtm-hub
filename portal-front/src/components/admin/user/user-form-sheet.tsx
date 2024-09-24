import * as React from 'react';
import { FunctionComponent, ReactNode } from 'react';
import { z, ZodSchema } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'filigran-ui/clients';
import { Button, Input, MultiSelectFormField } from 'filigran-ui/servers';
import { getRolesPortal } from '@/components/role-portal/role-portal.service';
import { getOrganizations } from '@/components/organization/organization.service';
import { userSlug_fragment$data } from '../../../../__generated__/userSlug_fragment.graphql';
import {
  userEditFormSchema,
  userFormSchema,
} from '@/components/admin/user/user-form.schema';
import useGranted from '@/hooks/useGranted';

interface UserFormSheetProps {
  user?: userSlug_fragment$data;
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  handleSubmit: (
    values: z.infer<typeof userEditFormSchema> | z.infer<typeof userFormSchema>
  ) => void;
  validationSchema: ZodSchema;
}

export const UserFormSheet: FunctionComponent<UserFormSheetProps> = ({
  user,
  open,
  setOpen,
  trigger,
  title,
  handleSubmit,
  validationSchema,
}) => {
  const currentRolesPortal = user?.roles_portal_id?.map(
    (rolePortalData) => rolePortalData.id
  );
  const rolePortal = getRolesPortal();
  const isFullAdmin = useGranted('BYPASS');

  let rolePortalData =
    rolePortal?.rolesPortal?.map(({ name, id }) => ({
      label: name,
      value: id,
    })) ?? [];

  if (!isFullAdmin) {
    rolePortalData = rolePortalData.filter((rolePortal) => {
      return rolePortal.label !== 'ADMIN' && rolePortal.label !== 'ADMIN_COMMU';
    });
  }
  const [organizationData] = getOrganizations();
  const defaultUser = { ...user };
  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: defaultUser.email,
      first_name: defaultUser.first_name,
      last_name: defaultUser.last_name,
      password: '',
      organization_id: defaultUser.organization?.id ?? '',
      roles_id: currentRolesPortal ?? [],
    },
  });

  const onSubmit = (values: z.infer<typeof validationSchema>) => {
    handleSubmit({
      ...values,
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
            className="w-full space-y-s">
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
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="First name"
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
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Last name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

            <FormField
              control={form.control}
              name="roles_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <FormControl>
                    <MultiSelectFormField
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

            {isFullAdmin ? (
              <FormField
                control={form.control}
                name="organization_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <Select
                      disabled={!isFullAdmin}
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizationData.organizations.edges.map(
                          ({ node }) => (
                            <SelectItem
                              key={node.id}
                              value={node.id}>
                              {node.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <> </>
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
