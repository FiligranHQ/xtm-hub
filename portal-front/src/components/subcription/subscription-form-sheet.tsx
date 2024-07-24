import * as React from 'react';
import { FunctionComponent, ReactNode, useState } from 'react';
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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Input } from 'filigran-ui/servers';
import { getOrganizations } from '@/components/organization/organization.service';
import { ServiceListCreateMutation } from '@/components/service/service.graphql';
import { serviceListMutation } from '../../../__generated__/serviceListMutation.graphql';
import { useMutation } from 'react-relay';

interface SubscriptionFormSheetProps {
  trigger: ReactNode;
  connectionId: string;
}

const onServiceFormSchema = z.object({
  service_name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  service_description: z.string().min(2, {
    message: 'Description must be at least 2 characters.',
  }),
  fee_type: z.string().min(2, {
    message: 'FeeType must be at least 2 characters.',
  }),
  price: z.number(),
  organization_id: z.string().min(2, {
    message: 'Organization must be at least 2 characters.',
  }),
  url: z.string().min(2, {
    message: 'FeeType must be at least 2 characters.',
  }),
});

export const SubscriptionFormSheet: FunctionComponent<
  SubscriptionFormSheetProps
> = ({ trigger, connectionId }) => {
  const [openSheet, setOpenSheet] = useState(false);

  const [organizationData] = getOrganizations();

  const form = useForm<z.infer<typeof onServiceFormSchema>>({
    resolver: zodResolver(onServiceFormSchema),
    defaultValues: {
      service_name: '',
      service_description: '',
      fee_type: '',
      organization_id: '',
      price: undefined,
      url: '',
    },
  });

  const [commitServiceAddMutation] = useMutation<serviceListMutation>(
    ServiceListCreateMutation
  );

  const onSubmit = (values: z.infer<typeof onServiceFormSchema>) => {
    console.log('values', values);
    commitServiceAddMutation({
      variables: {
        connections: [connectionId],
        input: { ...values },
      },
    });
    setOpenSheet(false);
  };

  return (
    <Sheet
      key={'right'}
      open={openSheet}
      onOpenChange={setOpenSheet}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader>
          <SheetTitle>{'Add new onDemand service here'}</SheetTitle>
          <SheetDescription>
            {'Fill the form about this new onDemand service.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-8">
            <FormField
              control={form.control}
              name="service_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Short description..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="http://my-url.com"
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
                      {organizationData.organizations.edges.map(({ node }) => (
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
