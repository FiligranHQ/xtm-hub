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
import * as React from 'react';
import { FunctionComponent, ReactNode, useEffect } from 'react';
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
  handleSubmit,
}) => {
  const form = useForm<z.infer<typeof organizationFormSchema>>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: organization?.name ?? '',
      domains: (organization?.domains as string[]) ?? [],
    },
  });
  useEffect(
    () => form.reset({ name: organization?.name ?? '' }),
    [organization, form]
  );
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
        <SheetHeader className="bg-white">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            className="w-full space-y-s"
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
