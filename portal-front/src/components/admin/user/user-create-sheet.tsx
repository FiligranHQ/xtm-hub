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
  useToast,
} from 'filigran-ui/clients';
import { Button, Input, MultiSelectFormField } from 'filigran-ui/servers';
import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'react-relay';
import {
  AddUserInput,
  userListCreateMutation,
} from '../../../../__generated__/userListCreateMutation.graphql';
import { UserListCreateMutation } from '@/components/admin/user/user.graphql';
import { userFormSchema } from '@/components/admin/user/user-form.schema';
import { AddIcon } from 'filigran-icon';
import { getRolesPortal } from '@/components/role-portal/role-portal.service';
import { getOrganizations } from '@/components/organization/organization.service';

interface UserListCreateProps {
  connectionID: string;
}

export const UserCreateSheet: FunctionComponent<UserListCreateProps> = ({
  connectionID,
}) => {
  const { toast } = useToast();

  const [open, setOpen] = useState<boolean>(false);

  const rolePortal = getRolesPortal();

  const rolePortalData =
    rolePortal?.rolesPortal.map(({ name, id }) => ({
      label: name ?? '',
      value: id,
    })) ?? [];

  const organizationData = getOrganizations();

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
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });
  }

  return (
    <>
      <Sheet
        key={'right'}
        open={open}
        onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="absolute bottom-4 right-4 z-10 rounded-3xl drop-shadow-xl">
            <AddIcon className="h-4 w-4" />
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
    </>
  );
};
