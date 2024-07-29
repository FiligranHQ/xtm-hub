import * as React from 'react';
import { FunctionComponent, ReactNode } from 'react';
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
  SheetTrigger,
} from 'filigran-ui/clients';
import { Button, Input, MultiSelectFormField } from 'filigran-ui/servers';
import { getOrganizations } from '@/components/organization/organization.service';
import { communityFormSchema } from '@/components/service/community/community-form-schema';

interface CommunityFormSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  description: string;
  handleSubmit: (values: z.infer<typeof communityFormSchema>) => void;
  validationSchema: ZodSchema;
}

export const CommunityFormSheet: FunctionComponent<CommunityFormSheetProps> = ({
  open,
  setOpen,
  trigger,
  title,
  description,
  handleSubmit,
  validationSchema,
}) => {
  const [organizations] = getOrganizations();
  const organizationsData =
    organizations.organizations.edges.map(({ node }) => ({
      label: node.name,
      value: node.id,
    })) ?? [];

  const form = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {},
  });

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
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-8">
            <FormField
              control={form.control}
              name="community_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Community name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="community_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Short description here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="open_feed_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Open Feed URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Open Feed URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="private_feed_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Private Feed URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="http://XXXX"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cyber_weather_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cyber Weather URL </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="http://XXXX"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="next_cloud_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Cloud URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="http://XXXX"
                      {...field}
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
