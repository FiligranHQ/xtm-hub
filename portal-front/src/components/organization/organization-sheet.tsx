import * as React from 'react';
import { FunctionComponent, ReactNode, useContext, useState } from 'react';
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
  useToast,
} from 'filigran-ui/clients';
import { Button, Input } from 'filigran-ui/servers';
import { SheetDescription } from 'filigran-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { useMutation } from 'react-relay';
import { organizationEditMutation } from '../../../__generated__/organizationEditMutation.graphql';
import {
  CreateOrganizationMutation,
  OrganizationEditMutation,
} from '@/components/organization/organization.graphql';
import { Organization } from '@/components/organization/organization-page';
import { organizationCreateMutation } from '../../../__generated__/organizationCreateMutation.graphql';
import { Portal, portalContext } from '@/components/portal-context';

interface OrganizationCreateProps {
  currentOrganization: Organization | undefined;
  onAddedOrganization: (newOrganization: Organization) => void;
  onEditedOrganization: (organization: Organization) => void;
  children: ReactNode;
}

export const OrganizationSheet: FunctionComponent<OrganizationCreateProps> = ({
  currentOrganization,
  onAddedOrganization,
  onEditedOrganization,
  children,
}) => {
  const [open, setOpenSheet] = useState<boolean>(false);

  const form = useForm<z.infer<typeof organizationFormSchema>>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: currentOrganization?.name ?? '',
    },
  });

  const [commitOrganizationEditionMutation] =
    useMutation<organizationEditMutation>(OrganizationEditMutation);
  const [commitOrganizationCreationMutation] =
    useMutation<organizationCreateMutation>(CreateOrganizationMutation);

  const { me } = useContext<Portal>(portalContext);
  const { toast } = useToast();

  const handleErrorMutation = () => {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: (
        <>
          {currentOrganization
            ? 'An error occured while editing this organization'
            : 'An error occured while creating an organization.'}
        </>
      ),
    });
  };

  function onSubmit(values: z.infer<typeof organizationFormSchema>): void {
    if (!me) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error while retrieving current user.',
      });
      return;
    }

    if (currentOrganization) {
      commitOrganizationEditionMutation({
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
          setOpenSheet(false);
        },
        onError: () => {
          handleErrorMutation();
        },
      });
    } else {
      commitOrganizationCreationMutation({
        variables: {
          connections: [me.id],
          ...values,
        },

        onCompleted: ({ addOrganization }) => {
          if (!addOrganization) {
            return;
          }
          onAddedOrganization(addOrganization);
          setOpenSheet(false);
        },
        onError: () => {
          handleErrorMutation();
        },
      });
    }
  }

  return (
    <>
      <Sheet
        key={'right'}
        open={open}
        onOpenChange={setOpenSheet}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side={'right'}>
          <SheetHeader>
            <SheetTitle>
              {currentOrganization
                ? "Edit the organization's name"
                : 'Create a new organization'}
            </SheetTitle>
            <SheetDescription>
              {currentOrganization
                ? "Edit the organization's name here"
                : 'Create the organization here'}
              . Click on {currentOrganization ? 'Update' : 'Create'} when you
              are done.
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
                  {currentOrganization ? 'Update' : 'Create'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
};
