'use client';

import { ArrowRightAltIcon } from '@filigran/icon';
import { Button, GradientButton } from '@filigran/ui/servers';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { RegisterRegisteredPlatformsQuery } from '@/components/registration/register/register.graphql';

import {
  CreateDeploymentRequestMutation,
  DeploymentRequestsAvailableQuery,
} from '@/components/service/trial-instances/trial-instances.graphql';

import {
  TryOpenCTIForm,
  tryOpenCTIFormSchema,
} from '@/components/service/trial-instances/try-opencti-form';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { toast } from '@filigran/ui/clients';
import { DeploymentRequestDeploymentTypeEnum } from '@generated/models/DeploymentRequestDeploymentType.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { trialInstancesCreateDeploymentRequestMutation } from '@generated/trialInstancesCreateDeploymentRequestMutation.graphql';

import {
  fetchQuery,
  loadQuery,
  useMutation,
  useRelayEnvironment,
} from 'react-relay';

import { useFreeTrial } from '@/components/service/trial-instances/useFreeTrials';
import { trialInstancesDeploymentRequestsAvailableQuery } from '@generated/trialInstancesDeploymentRequestsAvailableQuery.graphql';
import { z } from 'zod';

export enum StartTrialButtonVariant {
  Default = 'default',
  Gradient = 'gradient',
}

interface Props {
  openForm?: boolean;
  variant?: string;
  platformIdentifier?: PlatformIdentifierEnum;
}

// Component
export const StartTrialButton: React.FC<Props> = ({
  openForm = false,
  variant = StartTrialButtonVariant.Default,
  platformIdentifier = PlatformIdentifierEnum.OPENCTI,
}) => {
  const t = useTranslations();
  const environment = useRelayEnvironment();

  const { freeTrial, isBlacklisted } = useFreeTrial();

  if (isBlacklisted) {
    return (
      <Button
        className="ml-xl bg-white text-black hover:bg-white text-[12px] px-2 py-0.5 min-h-0 h-auto"
        disabled>
        {t('Service.Trials.StartTrial')}
        <ArrowRightAltIcon className="ml-s size-4" />
      </Button>
    );
  }

  const [openSheet, setOpenSheet] = useState(openForm);
  const [commitCreateDeploymentRequestMutationMutation] =
    useMutation<trialInstancesCreateDeploymentRequestMutation>(
      CreateDeploymentRequestMutation
    );

  const deploymentRequestsAvailabilityQueryRef = useMemo(
    () =>
      loadQuery<trialInstancesDeploymentRequestsAvailableQuery>(
        environment,
        DeploymentRequestsAvailableQuery,
        {
          platformIdentifier: platformIdentifier,
        }
      ),
    [environment, platformIdentifier]
  );

  const handleSubmit = (values: z.infer<typeof tryOpenCTIFormSchema>) => {
    setOpenSheet(false);
    const { acceptTerms: _, ...valuesWithoutAcceptTerms } = values;
    commitCreateDeploymentRequestMutationMutation({
      variables: {
        input: {
          ...valuesWithoutAcceptTerms,
          platform_identifier: platformIdentifier,
          type: DeploymentRequestDeploymentTypeEnum.TRIAL,
        },
      },
      updater: (store) => {
        store.invalidateStore();
        window.dispatchEvent(new Event('refresh-registered-platforms'));
        fetchQuery(environment, RegisterRegisteredPlatformsQuery, {
          input: { identifier: platformIdentifier },
        }).subscribe({});
      },

      onCompleted: () => {
        setOpenSheet(false);

        toast({
          title: t('Utils.Success'),
          description: t('Service.Trials.Form.FormRequested'),
        });
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
      title={t('Service.Trials.StartTrial')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={
        !freeTrial &&
        (variant === StartTrialButtonVariant.Default ? (
          <Button
            onClick={() => setOpenSheet(true)}
            className="bg-white text-black hover:bg-white text-[12px] px-2 py-0.5 min-h-0 h-auto">
            {t('Service.Trials.StartTrial')}
            <ArrowRightAltIcon className="ml-s size-4" />
          </Button>
        ) : (
          <GradientButton className="flex items-center">
            {t('Service.Trials.StartTrial')}
          </GradientButton>
        ))
      }>
      <TryOpenCTIForm
        handleSubmit={handleSubmit}
        handleCloseSheet={() => setOpenSheet(false)}
        deploymentRequestsAvailabilityQueryRef={
          deploymentRequestsAvailabilityQueryRef
        }
      />
    </SheetWithPreventingDialog>
  );
};
