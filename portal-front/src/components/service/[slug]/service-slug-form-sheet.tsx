import * as React from 'react';
import { FunctionComponent, ReactNode } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'filigran-ui/clients';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z, ZodSchema } from 'zod';
import { Button, Input, MultiSelectFormField } from 'filigran-ui/servers';
import { useMutation } from 'react-relay';
import { ServiceCapabilityCreateMutation } from '@/components/service/[slug]/capabilities/service-capability.graphql';
import { serviceCapabilityMutation } from '../../../../__generated__/serviceCapabilityMutation.graphql';
import { userServiceCreateMutation } from '../../../../__generated__/userServiceCreateMutation.graphql';
import { UserServiceCreateMutation } from '@/components/service/user_service.graphql';

interface ServiceSlugFormSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  connectionId: string;
  userService: any;
  subscriptionId: string;
  refetch: () => void;
}

let capabilitiesFormSchema = z.object({
  capabilities: z.array(z.string()),
});

export const ServiceSlugFormSheet: FunctionComponent<
  ServiceSlugFormSheetProps
> = ({
  open,
  setOpen,
  trigger,
  connectionId,
  userService,
  subscriptionId,
  refetch,
}) => {
  let capabilitiesEmailFormSchema;
  if (!userService.id) {
    capabilitiesEmailFormSchema = capabilitiesFormSchema.extend({
      email: z
        .string()
        .min(2, { message: 'Email must be at least 2 characters.' })
        .email('This is not a valid email.'),
    });
  }

  const currentCapabilities = userService?.service_capability?.map(
    (capability: any) => capability?.service_capability_name
  );

  const capabilitiesData = [
    {
      label: 'ADMIN_SUBSCRIPTION',
      value: 'ADMIN_SUBSCRIPTION',
    },
    {
      label: 'MANAGE_ACCESS',
      value: 'MANAGE_ACCESS',
    },
    {
      label: 'ACCESS_SERVICE',
      value: 'ACCESS_SERVICE',
    },
  ];

  const form = useForm<z.infer<ZodSchema>>({
    resolver: zodResolver(
      !userService.id
        ? (capabilitiesEmailFormSchema as z.ZodObject<{
            capabilities: z.ZodArray<z.ZodString, 'many'>;
            email: z.ZodString;
          }>)
        : capabilitiesFormSchema
    ),
    defaultValues: {
      email: '',
      capabilities: currentCapabilities,
    },
  });
  const [commitServiceCapabilityMutation] =
    useMutation<serviceCapabilityMutation>(ServiceCapabilityCreateMutation);
  const [commitUserServiceMutation] = useMutation<userServiceCreateMutation>(
    UserServiceCreateMutation
  );

  const onSubmit = (values: any) => {
    if (userService.id) {
      const editCapaValues = {
        capabilities: values.capabilities,
      };
      commitServiceCapabilityMutation({
        variables: {
          connections: [connectionId],
          input: { user_service_id: userService?.id, ...editCapaValues },
        },
      });
    } else {
      commitUserServiceMutation({
        variables: {
          input: {
            email: values.email,
            capabilities: values.capabilities,
            subscriptionId: subscriptionId,
          },
        },
        onCompleted() {
          refetch();
        },
      });
    }
    setOpen(false);
  };

  return (
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={'right'}>
        <SheetHeader>
          <SheetTitle>{'Capabilities'}</SheetTitle>
          <SheetDescription>
            {'Set the access rights here. Click Validate when you are done.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {userService.id ? (
              <></>
            ) : (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="capabilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capabilities</FormLabel>
                  <FormControl>
                    <MultiSelectFormField
                      options={capabilitiesData}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select capabilities"
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
