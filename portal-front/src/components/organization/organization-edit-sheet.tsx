import * as React from 'react';
import { FunctionComponent, useContext, useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'filigran-ui/clients';
import { Button, Input } from 'filigran-ui/servers';
import { EditIcon } from 'filigran-icon';
import { SheetDescription } from 'filigran-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { useMutation } from 'react-relay';
import { organizationCreateMutation } from '../../../__generated__/organizationCreateMutation.graphql';
import { Portal, portalContext } from '@/components/portal-context';
import { OrganizationEditMutation } from '@/components/organization/organization.graphql';
import { Organization } from '@/components/organization/organization-page';

interface OrganizationCreateProps {
  currentOrganization: Organization;
}

export const OrganizationEditSheet: FunctionComponent<
  OrganizationCreateProps
> = ({ currentOrganization }) => {
  const form = useForm<z.infer<typeof organizationFormSchema>>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: currentOrganization?.name,
    },
  });

  const [commitOrganizationMutation] = useMutation<organizationCreateMutation>(
    OrganizationEditMutation
  );
  const { me } = useContext<Portal>(portalContext);

  function onSubmit(values: z.infer<typeof organizationFormSchema>): void {
    if (!me) {
      console.log('Error while retrieving current user.');
      return;
    }
    const essai = { id: currentOrganization.id, ...values };
    console.log('values', values);
    console.log('essai', essai);
    commitOrganizationMutation({
      variables: {
        id: currentOrganization.id,
        input: values,
      },

      onCompleted: ({ addOrganization }) => {
        if (addOrganization) {
          const { id, name } = addOrganization;
          setOpen(false);
        }
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
        <Button
          variant="ghost"
          className="left-4 mr-4"
          aria-label="Delete Organization">
          <EditIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader>
          <SheetTitle>Edit the organization&apos;s name</SheetTitle>
          <SheetDescription>
            Edit the organization&apos;s name here. Click edit when you are
            done.
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
                Update
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
