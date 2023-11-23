import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import { userEditFormSchema } from '@/components/admin/user/user-form.schema';
import { organizationSelectQuery } from '../../../../../__generated__/organizationSelectQuery.graphql';
import { UserSlugEditMutation } from '@/components/admin/user/user.graphql';
import { userSlug_fragment$data } from '../../../../../__generated__/userSlug_fragment.graphql';
import {
  EditUserInput,
  userSlugEditMutation,
} from '../../../../../__generated__/userSlugEditMutation.graphql';
import { organizationFetch } from '@/components/organization/organization.graphql';

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
  const form = useForm<z.infer<typeof userEditFormSchema>>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      email: user.email ?? '',
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      password: '',
      organization_id: user?.organization.id ?? '',
    },
  });

  const [commitUserMutation] =
    useMutation<userSlugEditMutation>(UserSlugEditMutation);

  function onSubmit({
    email,
    first_name,
    last_name,
    organization_id,
  }: z.infer<typeof userEditFormSchema>) {
    const input: EditUserInput = {
      email,
      first_name,
      last_name,
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
