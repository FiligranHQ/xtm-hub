'use client';

import { SelectWithEditableField } from '@/components/service/registration/select-with-editable-field';
import { CancelDeploymentRequestMutation } from '@/components/service/trial-instances/trial-instances.graphql';
import { useOrgaFreeTrial } from '@/components/service/trial-instances/useOrgaFreeTrials';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
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
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
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
}

const OPTIONS = [
  'Intelligence lacks actionable insight for our specific needs',
  'Incompatible with our existing security stack',
  'Configuration is too complex to complete within a reasonable timeframe',
  'Internal security or legal team required immediate termination',
  'We lack the internal analysts/expertise to utilise the tool effectively',
];
const CANCELLATION_REASONS = OPTIONS.map((option) => ({
  value: option,
  label: option,
}));

export const TrialCancelSheet: FunctionComponent<TrialCancelSheetProps> = ({
  deploymentRequestId,
  isCancellationDefinitive,
  open,
  setOpen,
}) => {
  const t = useTranslations();
  const { refetch } = useOrgaFreeTrial();

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
        <div className="border border-solid border-orange rounded text-orange flex items-center gap-xs p-s text-sm mt-4">
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
                  options={CANCELLATION_REASONS}
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
            variant="outline"
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
