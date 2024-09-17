'use client';

import React, { FunctionComponent } from 'react';
import { PreloadedQuery, useMutation, usePreloadedQuery } from 'react-relay';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, Input } from 'filigran-ui/servers';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from 'filigran-ui/clients';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { settingsQuery } from '../../../__generated__/settingsQuery.graphql';
import { SettingsQuery } from '@/components/login/settings.graphql';
import { LoginFormMutation } from '@/components/login/login.graphql';

interface LoginFormProps {
  queryRef: PreloadedQuery<settingsQuery>;
}

const formSchema = z.object({
  email: z.string().email('This is not a valid email.'),
  password: z.string(),
});

// Component
const LoginForm: FunctionComponent<LoginFormProps> = ({ queryRef }) => {
  const router = useRouter();
  usePreloadedQuery<settingsQuery>(SettingsQuery, queryRef);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [commitLoginFormMutation] = useMutation(LoginFormMutation);
  const onSubmit = (variables: z.infer<typeof formSchema>) => {
    commitLoginFormMutation({
      variables,
      onCompleted() {
        // If login succeed, refresh the page
        router.refresh();
      },
    });
  };

  return (
    <main className="absolute inset-0 z-0 m-auto flex max-w-[450px] flex-col justify-center">
      <div className="mt-2 flex flex-col items-center">
        <Image
          src="/filigran_logo.svg"
          width={500}
          height={500}
          alt="Filigran logo"
        />
        <h1 className="pt-10 text-2xl">- Sign in -</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-s">
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
        <Button
          variant="outline"
          asChild>
          <Link
            className="w-full"
            type="submit"
            href={'/auth/oidc'}>
            OpenId Connect
          </Link>
        </Button>
      </div>
    </main>
  );
};

// Component export
export default LoginForm;
