import { TrialsUpdateDeploymentQuotaCapacityMutation } from '@/components/trials/trials.graphql';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import { isEmpty } from '@/lib/utils';
import { trialsDeploymentAvailabilityFragment$data } from '@generated/trialsDeploymentAvailabilityFragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  SheetFooter,
} from 'filigran-ui';
import { toast } from 'filigran-ui/clients';
import { Input } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { z } from 'zod';

interface Props {
  quota: trialsDeploymentAvailabilityFragment$data;
  callback: () => void;
}

const formSchema = z.object({
  region: z.string(),
  platformIdentifier: z.string(),
  newCapacity: z.int().min(0),
});

export const TrialsTabQuotasPlatformUpdateForm: React.FC<Props> = ({
  quota,
  callback,
}) => {
  const t = useTranslations();
  const { handleCloseSheet, setIsDirty } = useDialogContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: quota.region,
      platformIdentifier: quota.platform_identifier,
      newCapacity: quota.capacity,
    },
  });

  setIsDirty(!isEmpty(form.formState.dirtyFields));

  const [updateQuotaMutation] = useMutation(
    TrialsUpdateDeploymentQuotaCapacityMutation
  );
  const updateQuota = (values: z.infer<typeof formSchema>) => {
    updateQuotaMutation({
      variables: {
        input: {
          ...values,
        },
      },
      onCompleted: () => {
        toast({
          title: t('Utils.Success'),
          description: t('TrialsDashboard.UpdateQuotasForm.QuotasUpdated'),
        });
        callback();
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateQuota(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-xl">
        <FormField
          control={form.control}
          name="newCapacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('TrialsDashboard.UpdateQuotasForm.NewCapacityLabel')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t(
                    'TrialsDashboard.UpdateQuotasForm.NewCapacityLabel'
                  )}
                  type="number"
                  min={0}
                  onChange={(event) =>
                    field.onChange(Number.parseInt(event.target.value, 10))
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <SheetFooter className="justify-end pb-0">
          <div className="flex gap-s">
            <Button
              variant="outline"
              type="button"
              onClick={(e) => handleCloseSheet(e)}>
              {t('Utils.Cancel')}
            </Button>
            <Button
              disabled={!form.formState.isValid}
              type="submit">
              {t('Utils.Validate')}
            </Button>
          </div>
        </SheetFooter>
      </form>
    </Form>
  );
};
