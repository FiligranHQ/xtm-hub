'use client';

import { ArrowRightAltIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import GuardCapacityComponent from '@/components/admin-guard';

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
import { DeploymentTypeEnum } from '@generated/models/DeploymentType.enum';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { trialInstancesCreateDeploymentRequestMutation } from '@generated/trialInstancesCreateDeploymentRequestMutation.graphql';
import { toast } from 'filigran-ui/clients';

import {
  fetchQuery,
  loadQuery,
  useMutation,
  useRelayEnvironment,
} from 'react-relay';

import { cn } from '@/lib/utils';
import { trialInstancesDeploymentRequestsAvailableQuery } from '@generated/trialInstancesDeploymentRequestsAvailableQuery.graphql';
import { z } from 'zod';

interface Props {
  className?: string;
}

// Component
export const StartTrialButton: React.FC<Props> = ({ className }) => {
  const t = useTranslations();
  const environment = useRelayEnvironment();

  const [openSheet, setOpenSheet] = useState(false);
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
          platformIdentifier: PlatformIdentifierEnum.OPENCTI,
        }
      ),
    [environment]
  );

  const handleSubmit = (values: z.infer<typeof tryOpenCTIFormSchema>) => {
    setOpenSheet(false);
    const { acceptTerms: _, ...valuesWithoutAcceptTerms } = values;
    commitCreateDeploymentRequestMutationMutation({
      variables: {
        input: {
          ...valuesWithoutAcceptTerms,
          platform_identifier: PlatformIdentifierEnum.OPENCTI,
          type: DeploymentTypeEnum.TRIAL,
        },
      },
      updater: (store) => {
        store.invalidateStore();
        window.dispatchEvent(new Event('refresh-registered-platforms'));
        fetchQuery(environment, RegisterRegisteredPlatformsQuery, {
          input: { identifier: PlatformIdentifierEnum.OPENCTI },
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
        <GuardCapacityComponent
          shouldNotBePersonalSpace
          capacityRestriction={[
            OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
            OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
          ]}>
          <Button
            onClick={() => setOpenSheet(true)}
            className={cn(className, 'bg-white text-black hover:bg-white')}>
            {t('Service.Trials.StartTrial')}
            <ArrowRightAltIcon className="ml-s size-4" />
          </Button>
        </GuardCapacityComponent>
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
