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
import { SheetDescription } from 'filigran-ui';
import { Button, Input } from 'filigran-ui/servers';
import * as React from 'react';
import { FunctionComponent, ReactNode } from 'react';
import { z } from 'zod';
import { organizationFormSchema } from '@/components/organization/organization-form.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationItem_fragment$data } from '../../../__generated__/organizationItem_fragment.graphql';

interface OrganizationFormSheetProps {
  organization?: organizationItem_fragment$data;
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  description: string;
  handleSubmit: (values: z.infer<typeof organizationFormSchema>) => void;
}

export const OrganizationFormSheet: FunctionComponent<
  OrganizationFormSheetProps
> = ({
  organization,
  open,
  setOpen,
  trigger,
  title,
  description,
  handleSubmit,
}) => {
  const form = useForm<z.infer<typeof organizationFormSchema>>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: organization?.name ?? '',
    },
  });
  const onSubmit = (values: z.infer<typeof organizationFormSchema>) => {
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
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
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
                Validate
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
