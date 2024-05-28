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
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'filigran-ui/clients';
import { Button, Input } from 'filigran-ui/servers';
import { MultiSelectFormField } from 'filigran-ui/servers';

import { Pencil } from 'lucide-react';
import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import { userEditFormSchema } from '@/components/admin/user/user-form.schema';
import { organizationSelectQuery } from '../../../../../__generated__/organizationSelectQuery.graphql';
import { rolePortalSelectQuery } from '../../../../../__generated__/rolePortalSelectQuery.graphql';
import { UserSlugEditMutation } from '@/components/admin/user/user.graphql';
import { userSlug_fragment$data } from '../../../../../__generated__/userSlug_fragment.graphql';
import {
  EditUserInput,
  userSlugEditMutation,
} from '../../../../../__generated__/userSlugEditMutation.graphql';
import { organizationFetch } from '@/components/organization/organization.graphql';
import { rolePortalFetch } from '@/components/organization/role.graphql';

interface UserEditCreateProps {
  user: userSlug_fragment$data;
}

export const UserEditSheet: FunctionComponent<UserEditCreateProps> = ({
  user,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const queryOrganizationData = useLazyLoadQuery<organizationSelectQuery>(
    organizationFetch,
    {}
  );
  const organizationData = queryOrganizationData.organizations.edges;
  const queryRolePortalData = useLazyLoadQuery<rolePortalSelectQuery>(
    rolePortalFetch,
    {}
  );

  const rolePortalData = queryRolePortalData.rolesPortal;
  const form = useForm<z.infer<typeof userEditFormSchema>>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      email: user.email ?? '',
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      password: '',
      organization_id: user?.organization.id ?? '',
      role_portal_id: user?.role_portal[0]?.__id,
    },
  });

  const [commitUserMutation] =
    useMutation<userSlugEditMutation>(UserSlugEditMutation);

  function onSubmit({
    email,
    first_name,
    last_name,
    role_portal_id,
    organization_id,
  }: z.infer<typeof userEditFormSchema>) {
    const input: EditUserInput = {
      email,
      first_name,
      last_name,
      role_portal_id,
      organization_id,
    };
    commitUserMutation({
      variables: { id: user.id, input },
      onCompleted: () => setOpen(false),
    });
  }

  return (
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="absolute bottom-4 right-4 z-10 rounded-3xl drop-shadow-xl">
          <Pencil className="mr-1 h-4 w-4" />
          User
        </Button>
      </SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader>
          <SheetTitle>Edit user</SheetTitle>
          <SheetDescription>
            Edit the profile here. Click save when you are done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-8">
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
              name="role_portal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {rolePortalData.map(({ id, name }) => (
                        <SelectItem
                          key={id}
                          value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frameworks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frameworks</FormLabel>
                  <FormControl>
                    <MultiSelectFormField
                      options={[
                        { label: 'coucou', value: '1' },
                        { label: 'essai', value: '2' },
                        { label: 'hello', value: '3' },
                      ]}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select options"
                      variant="inverted"
                    />
                  </FormControl>
                  <FormDescription>
                    Choose the frameworks you are interested in.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizationData.map(({ node }) => (
                        <SelectItem
                          key={node.id}
                          value={node.id}>
                          {node.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-2">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button
                disabled={!form.formState.isDirty}
                type="submit">
                Save
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
