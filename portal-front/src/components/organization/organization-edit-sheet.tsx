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
import { organizationEditMutation } from '../../../__generated__/organizationEditMutation.graphql';
import { Portal, portalContext } from '@/components/portal-context';
import { OrganizationEditMutation } from '@/components/organization/organization.graphql';
import { Organization } from '@/components/organization/organization-page';
import { DialogInformative } from '@/components/ui/dialog';

interface OrganizationCreateProps {
  currentOrganization: Organization;
  onEditedOrganization: (organization: Organization) => void;
}

export const OrganizationEditSheet: FunctionComponent<
  OrganizationCreateProps
> = ({ currentOrganization, onEditedOrganization }) => {
  const [isErrorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
  };

  const form = useForm<z.infer<typeof organizationFormSchema>>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: currentOrganization?.name,
    },
  });

  const [commitOrganizationMutation] = useMutation<organizationEditMutation>(
    OrganizationEditMutation
  );
  const { me } = useContext<Portal>(portalContext);

  function onSubmit(values: z.infer<typeof organizationFormSchema>): void {
    if (!me) {
      console.log('Error while retrieving current user.');
      setErrorMessage('Error while retrieving current user.');
      setErrorDialogOpen(true);
      return;
    }
    commitOrganizationMutation({
      variables: {
        id: currentOrganization.id,
        input: values,
      },

      onCompleted: ({ editOrganization }) => {
        if (!editOrganization) {
          return;
        }
        onEditedOrganization({
          id: editOrganization.id,
          name: editOrganization.name,
        });
      },
      onError: (error) => {
        const message = error.message;
        setErrorMessage(message);
        setErrorDialogOpen(true);
      },
    });
  }

  const [open, setOpenSheet] = useState<boolean>(false);

  return (
    <>
      {' '}
      <Sheet
        key={'right'}
        open={open}
        onOpenChange={setOpenSheet}>
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
