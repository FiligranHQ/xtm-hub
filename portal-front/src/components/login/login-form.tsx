'use client';

import { LoginFormMutation } from '@/components/login/login.graphql';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  useToast,
} from 'filigran-ui/clients';
import { Button, Input } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('This is not a valid email.'),
  password: z.string(),
});

// Component
const LoginForm = () => {
  const router = useRouter();
  const t = useTranslations();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [commitLoginFormMutation] = useMutation(LoginFormMutation);
  const { toast } = useToast();

  const { redirect } = useDecodedQuery();
  const currentPath = usePathname();

  useEffect(() => {
    if (redirect) {
      router.push(redirect);

      toast({
        variant: 'destructive',
        title: t('Utils.Error'),
        description: t('Error.Disconnected'),
      });
    }
  }, [currentPath]);

  const onSubmit = (variables: z.infer<typeof formSchema>) => {
    commitLoginFormMutation({
      variables,
      onCompleted() {
        if (redirect) {
          router.push(redirect);
        }
        // If login succeed, refresh the page
        router.refresh();
      },
    });
  };
  return (
    <div className="bg-page-background border border-border-light rounded w-full p-l mb-l">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-l">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('LoginPage.Email')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('LoginPage.Email')}
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
                <FormLabel>{t('LoginPage.Password')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('LoginPage.Password')}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            className="w-full"
            type="submit">
            Sign in
          </Button>
        </form>
      </Form>
    </div>
  );
};

// Component export
export default LoginForm;
