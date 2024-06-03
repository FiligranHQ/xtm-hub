import { FunctionComponent, useContext, useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from 'filigran-ui/clients';
import { Button, Input } from 'filigran-ui/servers';
import { AddIcon } from 'filigran-icon';
import * as React from 'react';
import { SheetDescription } from 'filigran-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { useMutation } from 'react-relay';
import { CreateOrganizationMutation } from '@/components/organization/organization.graphql';
import { organizationCreateMutation } from '../../../__generated__/organizationCreateMutation.graphql';
import { Portal, portalContext } from '@/components/context';

interface OrganizationCreateProps {}
export const OrganizationCreateSheet: FunctionComponent<
  OrganizationCreateProps
> = () => {
  const form = useForm<z.infer<typeof organizationFormSchema>>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const [commitOrganizationMutation] = useMutation<organizationCreateMutation>(
    CreateOrganizationMutation
  );
  const { me } = useContext<Portal>(portalContext);

  function onSubmit(values: z.infer<typeof organizationFormSchema>): void {
    if (!me) {
      console.log('Error while retrieving current user.');
      return;
    }
    commitOrganizationMutation({
      variables: {
        connections: [me.id],
        ...values,
      },
      onCompleted: (response) => {
        console.log(response);
        setOpen(false);
      },
    });
  }

  const [open, setOpen] = useState<boolean>(false);

  return (
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="absolute z-10 ml-6 rounded-3xl drop-shadow-xl">
          {' '}
          <AddIcon className="mr-4 h-4 w-4" /> Create organization
        </Button>
      </SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader>
          <SheetTitle>Create a new organization</SheetTitle>
          <SheetDescription>
            Create the organization here. Click create when you are done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            className="space-y-4 pt-8"
            onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      {...field}
                    />
                  </FormControl>
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
