'use client';

import React from 'react';
import { graphql, useMutation } from 'react-relay';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email('This is not a valid email.'),
  password: z.string(),
});
// Relay
const LoginMutation = graphql`
  mutation loginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ...context_fragment
    }
  }
`;

// Component
const Login: React.FunctionComponent = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [commitLoginMutation] = useMutation(LoginMutation);

  function onSubmit(variables: z.infer<typeof formSchema>) {
    commitLoginMutation({
      variables,
      onCompleted() {
        // If login succeed, refresh the page
        router.refresh();
      },
    });
  }

  return (
    <>
      <main className="m-auto max-w-[450px]">
        <div className="mt-2 flex flex-col items-center">
          <Image
            src="/filigran_scred.svg"
            width={500}
            height={500}
            alt="Scred logo"
          />
          <h1 className="pt-10 text-2xl">- Sign in -</h1>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="password"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="w-full"
                type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </div>
        <div className="mt-2">
          <Button asChild>
            <Link
              type="submit"
              href={'http://localhost:4001/auth/oidc'}>
              OpenId Connect
            </Link>
          </Button>
        </div>
      </main>
    </>
  );
};

// Component export
export default Login;
