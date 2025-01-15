import { UseTranslationsProps } from '@/i18n/config';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  SheetFooter,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const staticMeFormSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
});

export const createMeFormSchema = (t: UseTranslationsProps) =>
  z.object({
    first_name: z.string().min(2, {
      message: t('UserForm.Error.FirstName'),
    }),
    last_name: z.string().min(2, {
      message: t('UserForm.Error.LastName'),
    }),
  });

interface MeUserFormSheetProps {
  handleSubmit: (values: z.infer<typeof staticMeFormSchema>) => void;
}

export const MeUserForm: FunctionComponent<MeUserFormSheetProps> = ({
  handleSubmit,
}) => {
  const t = useTranslations();
  const meFormSchema = useMemo(() => createMeFormSchema(t), [t]);

  const form = useForm<z.infer<typeof staticMeFormSchema>>({
    resolver: zodResolver(meFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
    },
  });
  const onSubmit = (values: z.infer<typeof staticMeFormSchema>) => {
    handleSubmit({
      ...values,
    });
  };

  return (
    <Form {...form}>
      <form
        className="w-full space-y-xl"
        onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('UserForm.FirstName')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('UserForm.FirstName')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('UserForm.LastName')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('UserForm.LastName')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SheetFooter className="pt-2">
          <Button
            disabled={!form.formState.isDirty}
            type="submit">
            {t('Utils.Validate')}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
};
