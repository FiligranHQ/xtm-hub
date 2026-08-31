'use client';

import { SelectWithEditableField } from '@/components/service/registration/SelectWithEditableField';
import { CancelDeploymentRequestMutation } from '@/components/service/trial-instances/trial-instances.graphql';
import { useOrgaFreeTrial } from '@/components/service/trial-instances/useOrgaFreeTrials';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { useTranslate } from '@/hooks/use-translate';
import { CheckIndeterminateIcon } from '@filigran/icon';
import {
  AutoForm,
  Button,
  FormItem,
  FormLabel,
  FormMessage,
  toast,
} from '@filigran/ui';
import { trialInstancesCancelDeploymentRequestMutation } from '@generated/trialInstancesCancelDeploymentRequestMutation.graphql';
import { PlatformIdentifier } from '@graphql/generated';
import { useRouter } from 'next/navigation';
import { useMutation } from 'react-relay';
import { z } from 'zod';

const trialCancelSchema = z.object({
  cancellation_reason: z.string().optional(),
});

interface TrialCancelSheetProps {
  deploymentRequestId: string;
  isCancellationDefinitive: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  platformIdentifier: PlatformIdentifier;
}

const REASONS = [
  'value',
  'compatibility',
  'complexity',
  'legal-security',
  'expertise',
];

export const TrialCancelSheet = ({
  deploymentRequestId,
  isCancellationDefinitive,
  open,
  setOpen,
  platformIdentifier,
}: TrialCancelSheetProps) => {
  const t = useTranslate();
  const cancellationReasons = REASONS.map((reason) => ({
    value: reason,
    label: t(`Service.Trials.CancellationReason.${reason}`),
  }));
  const { refetch } = useOrgaFreeTrial();
  const router = useRouter();

  const [cancelDeploymentRequestMutation] =
    useMutation<trialInstancesCancelDeploymentRequestMutation>(
      CancelDeploymentRequestMutation
    );

  const onSubmit = (values: z.infer<typeof trialCancelSchema>) => {
    cancelDeploymentRequestMutation({
      variables: {
        deploymentRequestId: deploymentRequestId,
        cancellationReason: values.cancellation_reason,
      },

      onCompleted: (response) => {
        const descriptionKey = response.cancelDeploymentRequest
          ?.counts_in_orga_quota
          ? 'Service.Trials.Cancellation.Toast.NoNewTrialPossible'
          : 'Service.Trials.Cancellation.Toast.NewTrialPossible';
        toast({
          title: t('Utils.Success'),
          description: t(descriptionKey),
        });
        refetch({}, { fetchPolicy: 'network-only' });
        setOpen(false);

        router.push(`/app/service/${platformIdentifier}-free-trial`);
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
      {isCancellationDefinitive && (
        <div className="border border-solid border-orange rounded text-feedback-warning-primary flex items-center gap-xs p-s text-sm mt-4">
          <CheckIndeterminateIcon className="shrink-0 h-4 w-4 mr-xs" />
          {t('Service.Trials.Cancellation.ConfirmationForm.NoNewTrialPossible')}
        </div>
      )}
      <AutoForm
        className="mt-l"
        formSchema={trialCancelSchema}
        onSubmit={(values) => {
          onSubmit(values);
        }}
        fieldConfig={{
          cancellation_reason: {
            label: 'Cancel Trial',
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
