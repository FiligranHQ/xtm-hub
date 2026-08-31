'use client';

import { LoginFormMutation } from '@/components/login/login.graphql';
import useDecodedQuery from '@/hooks/use-decoded-query';
import { useTranslate } from '@/hooks/use-translate';
import { decodeSafeRedirect } from '@/utils/redirect';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  toast,
} from '@filigran/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { z } from 'zod';

const formSchema = z.object({
  email: z.email('This is not a valid email.'),
  password: z.string(),
});

// Component
const LoginForm = () => {
  const router = useRouter();
  const t = useTranslate();
  const { redirect } = useDecodedQuery();
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
      onError() {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Login.LoginError`),
        });
      },
      onCompleted() {
        const destination = decodeSafeRedirect(redirect);
        if (destination) {
          // /edition and /edition/exit are Route Handlers, not pages: a
          // client-side router.push() to them is a no-op as far as the
          // server is concerned (there's no RSC payload to fetch), so the
          // cookie-setting logic they run would silently never fire. Force
          // a real browser navigation for those so the request actually
          // reaches the server.
          if (destination.startsWith('/edition')) {
            window.location.href = destination;
            return;
          }
          router.push(destination);
        }
        // If login succeed, refresh the page
        router.refresh();
      },
    });
  };
  return (
    <div className="bg-elevation-background-layer-1 border border-border-light rounded w-full p-l mb-l">
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
            {t('LoginPage.SignIn')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

// Component export
export default LoginForm;
