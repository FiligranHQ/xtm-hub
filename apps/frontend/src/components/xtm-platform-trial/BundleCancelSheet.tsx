'use client';

import { SelectWithEditableField } from '@/components/service/registration/SelectWithEditableField';
import { CancelDeploymentRequestMutation } from '@/components/service/trial-instances/trial-instances.graphql';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import {
  AutoForm,
  Button,
  FormItem,
  FormLabel,
  FormMessage,
  toast,
} from '@filigran/ui';
import { trialInstancesCancelDeploymentRequestMutation } from '@generated/trialInstancesCancelDeploymentRequestMutation.graphql';
import { xtmPlatformBundleKeys } from '@graphql/deployment/deployment.keys';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';

const buildBundleCancelSchema = (requiredMessage: string) =>
  z.object({
    cancellation_reason: z.string().min(1, requiredMessage),
  });

type BundleCancelSchema = ReturnType<typeof buildBundleCancelSchema>;

const REASONS = [
  'value',
  'compatibility',
  'complexity',
  'legal-security',
  'expertise',
];

interface BundleCancelSheetProps {
  deploymentRequestId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const BundleCancelSheet = ({
  deploymentRequestId,
  open,
  setOpen,
}: BundleCancelSheetProps) => {
  const t = useTranslations();
  const bundleCancelSchema = useMemo(
    () =>
      buildBundleCancelSchema(
        t(
          'Service.Trials.Cancellation.ConfirmationForm.CancellationReasonRequired'
        )
      ),
    [t]
  );
  const queryClient = useQueryClient();
  const cancellationReasons = REASONS.map((reason) => ({
    value: reason,
    label: t(`Service.Trials.CancellationReason.${reason}`),
  }));

  const [cancelDeploymentRequestMutation] =
    useMutation<trialInstancesCancelDeploymentRequestMutation>(
      CancelDeploymentRequestMutation
    );

  const onSubmit = (values: z.infer<BundleCancelSchema>) => {
    cancelDeploymentRequestMutation({
      variables: {
        deploymentRequestId,
        cancellationReason: values.cancellation_reason,
      },
      onCompleted: () => {
        toast({
          title: t('Utils.Success'),
          description: t(
            'Service.Trials.Cancellation.Toast.NoNewTrialPossible'
          ),
        });
        queryClient.invalidateQueries({
          queryKey: xtmPlatformBundleKeys.activeXtmPlatformBundle(),
        });
        setOpen(false);
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

  return (
    <SheetWithPreventingDialog
      open={open}
      setOpen={setOpen}
      title={t('Service.Trials.Cancellation.ConfirmationForm.Title')}>
      <AutoForm
        className="mt-l"
        formSchema={bundleCancelSchema}
        onSubmit={onSubmit}
        fieldConfig={{
          cancellation_reason: {
            label: t(
              'Service.Trials.Cancellation.ConfirmationForm.CancellationReason'
            ),
            fieldType: ({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(
                    'Service.Trials.Cancellation.ConfirmationForm.CancellationReason'
                  )}
                  <span className="text-sm text-destructive">*</span>
                </FormLabel>
                <SelectWithEditableField
                  onChange={field.onChange}
                  options={cancellationReasons}
                  labels={{
                    placeholder: t(
                      'Service.Trials.Cancellation.ConfirmationForm.CancellationReasonPlaceholder'
                    ),
                    editableFieldLabel: t(
                      'Service.Trials.Cancellation.ConfirmationForm.CancellationReasonOther'
                    ),
                    editableFieldPlaceholder: t(
                      'Service.Trials.Cancellation.ConfirmationForm.CancellationReasonOtherPlaceholder'
                    ),
                  }}
                  editableFieldValue="Other"
                />
                <FormMessage className="text-sm text-destructive" />
              </FormItem>
            ),
          },
        }}>
        <div className="flex justify-end gap-s">
          <Button
            variant="secondary"
            type="button"
            onClick={() => setOpen(false)}>
            {t('Utils.Cancel')}
          </Button>
          <Button type="submit">{t('Utils.Continue')}</Button>
        </div>
      </AutoForm>
    </SheetWithPreventingDialog>
  );
};
