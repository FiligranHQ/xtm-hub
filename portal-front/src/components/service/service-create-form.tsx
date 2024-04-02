import * as React from 'react';
import { useMutation } from 'react-relay';
import { serviceListMutation } from '../../../__generated__/serviceListMutation.graphql';
import { ServiceListCreateMutation } from '@/components/service/service.graphql';
import { useForm } from 'react-hook-form';
import { Button } from 'filigran-ui/servers';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface ServiceCreateFormProps {
  connectionID: string;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
});
const ServiceCreateForm: React.FunctionComponent<ServiceCreateFormProps> = ({
  connectionID,
}) => {
  const [commitServiceMutation] = useMutation<serviceListMutation>(
    ServiceListCreateMutation
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    commitServiceMutation({
      variables: { connections: [connectionID], ...values },
    });
  }

  return (
    <>
      <h2 className="pt-6 text-2xl">- Create new service -</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={'Service name'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="mb-2 mt-3 w-full"
            type="submit">
            Create
          </Button>
        </form>
      </Form>
    </>
  );
};

export default ServiceCreateForm;
