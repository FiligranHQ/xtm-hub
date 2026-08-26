import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { useTranslate } from '@/hooks/use-translate';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from '@filigran/ui';
import { PlatformIdentifier } from '@graphql/generated';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

interface ReachSalesDialogFormProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  onSubmit: (message: string) => void;
  platformIdentifier: PlatformIdentifier;
}

const reachSalesSchema = z.object({
  message: z.string().min(1, 'Required'),
});

export const ReachSalesDialogForm = ({
  isDialogOpen,
  setIsDialogOpen,
  onSubmit,
  platformIdentifier: _platformIdentifier,
}: ReachSalesDialogFormProps) => {
  const t = useTranslate();

  const form = useForm<z.infer<typeof reachSalesSchema>>({
    resolver: zodResolver(reachSalesSchema),
    defaultValues: {
      message: '',
    },
  });

  const message = useWatch({
    control: form.control,
    name: 'message',
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
      isOpen={isDialogOpen}
      continueButtonDisabled={!message?.trim()}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('Service.Trials.ReachOutToSalesMessagePlaceholder')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t(
                      'Service.Trials.ReachOutToSalesDefaultMessage'
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </AlertDialogComponent>
  );
};
