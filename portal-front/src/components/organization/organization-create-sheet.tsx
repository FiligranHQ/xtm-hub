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
import { AddIcon } from 'filigran-icon';
import { SheetDescription } from 'filigran-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { useMutation } from 'react-relay';
import { CreateOrganizationMutation } from '@/components/organization/organization.graphql';
import { organizationCreateMutation } from '../../../__generated__/organizationCreateMutation.graphql';
import { Portal, portalContext } from '@/components/portal-context';
import { Organization } from '@/components/organization/organization-page';
import { DialogInformative } from '@/components/ui/dialog';

interface OrganizationCreateProps {
  onAddedOrganization: (newOrganization: Organization) => void;
}

export const OrganizationCreateSheet: FunctionComponent<
  OrganizationCreateProps
> = ({ onAddedOrganization }) => {
  const form = useForm<z.infer<typeof organizationFormSchema>>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const [isErrorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
  };

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

      onCompleted: ({ addOrganization }) => {
        if (addOrganization) {
          const { id, name } = addOrganization;
          onAddedOrganization({ id, name });
          setOpen(false);
        }
      },
      onError: (error) => {
        const message = error.message;
        setErrorMessage(message);
        setErrorDialogOpen(true);
      },
    });
  }

  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Sheet
        key={'right'}
        open={open}
        onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            aria-label="Create Organization"
            className="absolute bottom-4 right-4 z-10 rounded-3xl drop-shadow-xl">
            <AddIcon className="h-4 w-4" />
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
      <DialogInformative
        isOpen={isErrorDialogOpen}
        onClose={handleCloseErrorDialog}
        title="Error"
        description={'An error occured while editing this organization.'}>
        <p>{errorMessage}</p>
      </DialogInformative>
    </>
  );
};
