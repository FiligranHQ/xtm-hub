import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from '@filigran/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Props {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  onSubmit: (message: string) => void;
}

const reachSalesSchema = z.object({
  message: z.string().min(1, 'Required'),
});

export const ReachSalesDialogForm: React.FC<Props> = ({
  isDialogOpen,
  setIsDialogOpen,
  onSubmit,
}) => {
  const t = useTranslations();
  const form = useForm<z.infer<typeof reachSalesSchema>>({
    resolver: zodResolver(reachSalesSchema),
    defaultValues: {
      message: t('Service.Trials.ReachOutToSalesDefaultMessage'),
    },
  });

  const handleSubmit = (values: z.infer<typeof reachSalesSchema>) => {
    onSubmit(values.message);
    form.reset();
  };

  return (
    <AlertDialogComponent
      AlertTitle={t('Service.Trials.ReachOutToSales')}
      onClickContinue={form.handleSubmit(handleSubmit)}
      onOpenChange={setIsDialogOpen}
      isOpen={isDialogOpen}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    {t('Service.Trials.ReachOutToSalesMessagePlaceholder')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'Service.Trials.ReachOutToSalesMessagePlaceholder'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </form>
      </Form>
    </AlertDialogComponent>
  );
};
