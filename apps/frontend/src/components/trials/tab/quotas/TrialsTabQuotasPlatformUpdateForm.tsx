import { TrialsUpdateDeploymentQuotaCapacityMutation } from '@/components/trials/trials.graphql';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { useDialogContext } from '@/components/ui/SheetWithPreventingDialog';
import { isEmpty } from '@/lib/utils';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  SheetFooter,
} from '@filigran/ui';
import { toast } from '@filigran/ui/clients';
import { Input } from '@filigran/ui/servers';
import { trialsDeploymentAvailabilityFragment$data } from '@generated/trialsDeploymentAvailabilityFragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { z } from 'zod';

interface TrialsTabQuotasPlatformUpdateFormProps {
  quota: trialsDeploymentAvailabilityFragment$data;
  callback: () => void;
}

const formSchema = z.object({
  region: z.string(),
  platformIdentifier: z.string(),
  newCapacity: z.int().min(0),
});

export const TrialsTabQuotasPlatformUpdateForm = ({
  quota,
  callback,
}: TrialsTabQuotasPlatformUpdateFormProps) => {
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
  const [values, setValues] = useState<z.infer<typeof formSchema>>();
  const updateQuota = () => {
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

  const onSubmit = (newValues: z.infer<typeof formSchema>) => {
    setValues(newValues);
  };
  const translatedRegion = t(`Region.${quota.region.toUpperCase()}`);

  return (
    <>
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
                variant="secondary"
                type="button"
                onClick={(e) => handleCloseSheet(e)}>
                {t('Utils.Cancel')}
              </Button>
              <AlertDialogComponent
                AlertTitle={t(
                  'TrialsDashboard.UpdateQuotasForm.AlertDialog.ConfirmTitle',
                  {
                    region: translatedRegion,
                  }
                )}
                actionButtonText={t('Utils.Validate')}
                triggerElement={
                  <Button
                    disabled={!form.formState.isValid}
                    type="submit">
                    {t('Utils.Validate')}
                  </Button>
                }
                onClickContinue={() => updateQuota()}>
                <p>
                  {t(
                    'TrialsDashboard.UpdateQuotasForm.AlertDialog.ConfirmDescription',
                    {
                      region: translatedRegion,
                      oldCapacity: quota.capacity,
                      newCapacity: values?.newCapacity ?? 0,
                    }
                  )}
                  <br />
                  {t(
                    'TrialsDashboard.UpdateQuotasForm.AlertDialog.ConfirmSentence'
                  )}
                </p>
              </AlertDialogComponent>
            </div>
          </SheetFooter>
        </form>
      </Form>
    </>
  );
};
