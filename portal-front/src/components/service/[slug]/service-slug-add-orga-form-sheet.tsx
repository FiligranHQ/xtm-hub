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
  useToast,
} from 'filigran-ui/clients';
import { useForm } from 'react-hook-form';
import { z, ZodSchema } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'filigran-ui/servers';
import { useMutation } from 'react-relay';
import { AddSubscriptionInCommunityMutation } from '@/components/subcription/subscription.graphql';
import { subscriptionInCommunityCreateMutation } from '../../../../__generated__/subscriptionInCommunityCreateMutation.graphql';

interface ServiceSlugAddOrgaFormSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  connectionId: string;
  serviceId: string;
  insertedOrganization: (organization: any) => void;
}

export const ServiceSlugAddOrgaFormSheet: FunctionComponent<
  ServiceSlugAddOrgaFormSheetProps
> = ({
  open,
  setOpen,
  trigger,
  connectionId,
  serviceId,
  insertedOrganization,
}) => {
  const [organizations] = getOrganizations();
  const { toast } = useToast();
  const [commitSubscriptionCreateMutation] =
    useMutation<subscriptionInCommunityCreateMutation>(
      AddSubscriptionInCommunityMutation
    );

  const onSubmit = (inputValue: z.infer<ZodSchema>) => {
    commitSubscriptionCreateMutation({
      variables: {
        connections: [connectionId],
        service_id: serviceId,
        organization_id: inputValue.organization_id,
      },
      onCompleted: (response) => {
        toast({
          title: 'Success',
          description: 'Organization added',
        });
        insertedOrganization(response);
      },
      onError: (error: Error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });
    setOpen(false);
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
      organization_id: '',
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
          <SheetTitle className="txt-title">{'Add organization'}</SheetTitle>
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