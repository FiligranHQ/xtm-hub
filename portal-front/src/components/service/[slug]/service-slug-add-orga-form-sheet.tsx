import * as React from 'react';
import { FunctionComponent, ReactNode } from 'react';
import { getOrganizations } from '@/components/organization/organization.service';
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
import { useForm } from 'react-hook-form';
import { z, ZodSchema } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'filigran-ui/servers';

interface ServiceSlugAddOrgaFormSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
}

export const ServiceSlugAddOrgaFormSheet: FunctionComponent<
  ServiceSlugAddOrgaFormSheetProps
> = ({ open, setOpen, trigger }) => {
  const [organizations] = getOrganizations();
  const onSubmit = (inputValue: string) => {
    console.log('inputValue', inputValue);
  };

  const form = useForm<z.infer<ZodSchema>>({
    resolver: zodResolver(
      z.object({
        organization_id: z.string().min(2, {
          message: 'You must choose an organization.',
        }),
      })
    ),
    defaultValues: {
      email: '',
    },
  });

  return (
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader className="bg-white">
          <SheetTitle>{'Add organization'}</SheetTitle>
        </SheetHeader>
        <SheetDescription>
          {
            'Invite an organization in you community. Its members will have access to all of this community services.'
          }
        </SheetDescription>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-s">
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
                      {organizations.organizations.edges.map(({ node }) => (
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
                Validate
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};