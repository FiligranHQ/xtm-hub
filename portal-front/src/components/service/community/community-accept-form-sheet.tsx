import * as React from 'react';
import { FunctionComponent } from 'react';
import { z, ZodSchema } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
} from 'filigran-ui/clients';
import { Button, Input, MultiSelectFormField } from 'filigran-ui/servers';
import { communityFormSchema } from '@/components/service/community/community-form-schema';
import { getOrganizations } from '@/components/organization/organization.service';

interface CommunityAcceptFormSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  justification: string;
  handleSubmit: (values: z.infer<typeof communityFormSchema>) => void;
  validationSchema: ZodSchema;
}

export const CommunityAcceptFormSheet: FunctionComponent<
  CommunityAcceptFormSheetProps
> = ({
  open,
  setOpen,
  title,
  description,
  justification,
  handleSubmit,
  validationSchema,
}) => {
  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {},
  });

  const [organizations] = getOrganizations();
  const organizationsData =
    organizations.organizations.edges.map(({ node }) => ({
      label: node.name,
      value: node.id,
    })) ?? [];

  const onSubmit = (values: z.infer<typeof validationSchema>) => {
    handleSubmit({
      ...values,
    });
  };

  return (
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetContent side={'right'}>
        <SheetHeader className="bg-white">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {justification}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-s">
            <FormField
              control={form.control}
              name="fee_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a fee type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem
                        key={'MONTHLY'}
                        value={'MONTHLY'}>
                        {'MONTHLY'}
                      </SelectItem>
                      <SelectItem
                        key={'YEARLY'}
                        value={'YEARLY'}>
                        {'YEARLY'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizations_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organizations</FormLabel>
                  <FormControl>
                    <MultiSelectFormField
                      options={organizationsData}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select organizations"
                      variant="inverted"
                    />
                  </FormControl>

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