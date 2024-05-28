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
import { MultiSelectFormField } from 'filigran-ui/servers';

import {
  Button,
  Input,
} from 'filigran-ui';
import { Pencil } from 'lucide-react';
import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import { organizationSelectQuery } from '../../../../__generated__/organizationSelectQuery.graphql';
import {
  AddUserInput,
  userListCreateMutation,
} from '../../../../__generated__/userListCreateMutation.graphql';
import { UserListCreateMutation } from '@/components/admin/user/user.graphql';
import { userFormSchema } from '@/components/admin/user/user-form.schema';
import { organizationFetch } from '@/components/organization/organization.graphql';
import { rolePortalSelectQuery } from '../../../../__generated__/rolePortalSelectQuery.graphql';
import { rolePortalFetch } from '@/components/organization/role.graphql';

interface UserListCreateProps {
  connectionID: string;
}

interface RolePortal {
  name: string;
  id: string;
}

export const UserCreateSheet: FunctionComponent<UserListCreateProps> = ({
  connectionID,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const queryOrganizationData = useLazyLoadQuery<organizationSelectQuery>(
    organizationFetch,
    {}
  );

  const queryRolePortalData = useLazyLoadQuery<rolePortalSelectQuery>(
    rolePortalFetch,
    {}
  );

  const rolePortalData = queryRolePortalData.rolesPortal.map(
    (rolePortal: RolePortal) => {
      return {
        label: rolePortal.name,
        value: rolePortal.id,
      };
    }
  );

  const organizationData = queryOrganizationData.organizations.edges;
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      organization_id: '',
      roles_id: [],
    },
  });

  const [commitUserMutation] = useMutation<userListCreateMutation>(
    UserListCreateMutation
  );

  function onSubmit({
    email,
    password,
    organization_id,
    first_name,
    last_name,
    roles_id,
  }: z.infer<typeof userFormSchema>) {
    const input: AddUserInput = {
      email,
      password,
      organization_id,
      first_name,
      last_name,
      roles_id,
    };

    commitUserMutation({
      variables: { input, connections: [connectionID] },
      onCompleted: (response) => {
        console.log(response);
        setOpen(false);
      },
    });
  }

  return (
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="absolute bottom-4 right-4 z-10 rounded-3xl drop-shadow-xl">
          <Plus className="mr-1 h-4 w-4" />
          User
        </Button>
      </SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader>
          <SheetTitle>Create a new user</SheetTitle>
          <SheetDescription>
            Create the profile here. Click create when you are done.
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
                Create
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
