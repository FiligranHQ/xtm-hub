'use client';

import { ArrowRightAltIcon } from '@filigran/icon';
import { Button, GradientButton } from '@filigran/ui/servers';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { invalidatePrivateNavigationQueries } from '@/components/menu/private-navigation-query-invalidation';
import { RegisterRegisteredPlatformsQuery } from '@/components/registration/register/register.graphql';

import {
  CreateDeploymentRequestMutation,
  DeploymentRequestsAvailableQuery,
} from '@/components/service/trial-instances/trial-instances.graphql';

import {
  TryFiligranProductForm,
  tryFiligranProductFormSchema,
} from '@/components/service/trial-instances/TryFiligranProductForm';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
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

import { useOrgaFreeTrial } from '@/components/service/trial-instances/useOrgaFreeTrials';
import { DeploymentRequestSourceEnum } from '@generated/models/DeploymentRequestSource.enum';
import { trialInstancesDeploymentRequestsAvailableQuery } from '@generated/trialInstancesDeploymentRequestsAvailableQuery.graphql';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

interface StartTrialButtonProps {
  openForm?: boolean;
  platformIdentifier?: PlatformIdentifierEnum;
  source: DeploymentRequestSourceEnum;
}

// Component
export const StartTrialButton = ({
  openForm = false,
  platformIdentifier = PlatformIdentifierEnum.OPENCTI,
  source,
}: StartTrialButtonProps) => {
  const t = useTranslations();
  const environment = useRelayEnvironment();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { availableTrials, isBlacklisted, refetch } = useOrgaFreeTrial();

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
  const [commitCreateDeploymentRequest] =
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

  const handleSubmit = (
    values: z.infer<typeof tryFiligranProductFormSchema>
  ) => {
    setOpenSheet(false);
    const { acceptTerms: _, ...valuesWithoutAcceptTerms } = values;
    commitCreateDeploymentRequest({
      variables: {
        input: {
          ...valuesWithoutAcceptTerms,
          platform_identifier: platformIdentifier,
          type: DeploymentRequestDeploymentTypeEnum.TRIAL,
          source,
        },
      },
      updater: (store) => {
        store.invalidateStore();
        window.dispatchEvent(new Event('refresh-registered-platforms'));
        fetchQuery(environment, RegisterRegisteredPlatformsQuery, {
          input: { identifier: platformIdentifier },
        }).subscribe({});
        refetch({}, { fetchPolicy: 'network-only' });
      },
      onCompleted: (response) => {
        invalidatePrivateNavigationQueries(queryClient);
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('Service.Trials.Form.FormRequested'),
        });

        const serviceInstanceId =
          response?.createDeploymentRequest?.service_instance_id;
        if (serviceInstanceId) {
          router.push(
            `/app/service/${platformIdentifier}_registration/${serviceInstanceId}`
          );
        }
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
        availableTrials.length > 0 && (
          <GradientButton className="bg-white dark:bg-none flex items-center">
            {t('Service.Trials.StartTrial')}
          </GradientButton>
        )
      }>
      <TryFiligranProductForm
        handleSubmit={handleSubmit}
        handleCloseSheet={() => setOpenSheet(false)}
        deploymentRequestsAvailabilityQueryRef={
          deploymentRequestsAvailabilityQueryRef
        }
        platformIdentifier={platformIdentifier}
      />
    </SheetWithPreventingDialog>
  );
};
