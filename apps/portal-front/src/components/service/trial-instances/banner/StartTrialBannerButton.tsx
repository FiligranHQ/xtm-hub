'use client';

import { ArrowRightAltIcon, KeyboardArrowRightIcon } from '@filigran/icon';
import { Button } from '@filigran/ui/servers';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import { RegisterRegisteredPlatformsQuery } from '@/components/registration/register/register.graphql';

import {
  CreateDeploymentRequestMutation,
  DeploymentRequestsAvailableQuery,
} from '@/components/service/trial-instances/trial-instances.graphql';

import { toast } from '@filigran/ui/clients';
import { DeploymentRequestDeploymentTypeEnum } from '@generated/models/DeploymentRequestDeploymentType.enum';
import { trialInstancesCreateDeploymentRequestMutation } from '@generated/trialInstancesCreateDeploymentRequestMutation.graphql';
import { SheetWithPreventingDialog } from '../../../ui/SheetWithPreventingDialog';
import {
  TryFiligranProductForm,
  tryFiligranProductFormSchema,
} from '../TryFiligranProductForm';

import {
  fetchQuery,
  loadQuery,
  useMutation,
  useRelayEnvironment,
} from 'react-relay';

import { PlatformMetadataMapping } from '@/components/registration/platform-identifier-mapping';
import { useOrgaFreeTrial } from '@/components/service/trial-instances/useOrgaFreeTrials';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@filigran/ui';
import { DeploymentRequestSourceEnum } from '@generated/models/DeploymentRequestSource.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { PlatformIdentifier } from '@generated/OneClickDeployMutation.graphql';
import { trialInstancesDeploymentRequestsAvailableQuery } from '@generated/trialInstancesDeploymentRequestsAvailableQuery.graphql';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { IconActionContext } from '../../../ui/IconActions';
import { PRODUCTS_AVAILABLE_ON_TRIAL } from './TryFiligranProductsBanner';

// Component
export const StartTrialBannerButton = () => {
  const t = useTranslations();
  const environment = useRelayEnvironment();
  const router = useRouter();
  const { availableTrials, isBlacklisted, refetch } = useOrgaFreeTrial();

  const [openSheet, setOpenSheet] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [platformIdentifier, setPlatformIdentifier] =
    useState<PlatformIdentifier>(PlatformIdentifierEnum.OPENCTI);
  if (isBlacklisted) {
    return (
      <Button
        className="ml-xl bg-white text-black hover:bg-white text-[12px] px-2 py-0.5 min-h-0 h-auto"
        disabled>
        {t('Service.Trials.StartTrial')}
        <KeyboardArrowRightIcon className="ml-s size-4" />
      </Button>
    );
  }
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

  const handleSubmit = (
    values: z.infer<typeof tryFiligranProductFormSchema>
  ) => {
    setOpenSheet(false);
    const { acceptTerms: _, ...valuesWithoutAcceptTerms } = values;
    commitCreateDeploymentRequestMutationMutation({
      variables: {
        input: {
          ...valuesWithoutAcceptTerms,
          platform_identifier: platformIdentifier,
          type: DeploymentRequestDeploymentTypeEnum.TRIAL,
          source: DeploymentRequestSourceEnum.XTMHUB,
        },
      },
      updater: () => {
        window.dispatchEvent(new Event('refresh-registered-platforms'));
        fetchQuery(environment, RegisterRegisteredPlatformsQuery, {
          input: { identifier: platformIdentifier },
        }).subscribe({});
        refetch({}, { fetchPolicy: 'network-only' });
      },

      onCompleted: (response) => {
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
  const handleProductChosen = (platformIdentifier: PlatformIdentifier) => {
    setOpenSheet(true);
    setMenuOpen(false);
    setPlatformIdentifier(platformIdentifier);
  };

  const getButton = (product: PlatformIdentifierEnum) => {
    return (
      <Button
        variant="ghost"
        onClick={() => handleProductChosen(product)}>
        <Image
          width="25"
          height="25"
          src={PlatformMetadataMapping[product].logoUrl}
          alt="Logo"
          className="mr-s"
        />
        {PlatformMetadataMapping[product].name}
      </Button>
    );
  };
  return (
    <SheetWithPreventingDialog
      title={t('Service.Trials.StartTrialWithName', {
        platformName: PlatformMetadataMapping[platformIdentifier].name,
      })}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={
        availableTrials.length === PRODUCTS_AVAILABLE_ON_TRIAL ? (
          <DropdownMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-s cursor-pointer">
                <Button
                  onClick={() => setOpenSheet(true)}
                  className="bg-white text-black hover:bg-white text-[12px] px-2 py-0.5 min-h-0 h-auto">
                  {t('Service.Trials.StartTrial')}
                  <div
                    className={`ml-s inline-flex transition-transform ${
                      menuOpen ? 'rotate-90' : 'rotate-0'
                    }`}>
                    <KeyboardArrowRightIcon className="h-3 w-3" />
                  </div>
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-full flex flex-col">
              <IconActionContext.Provider value={{ setMenuOpen }}>
                {getButton(PlatformIdentifierEnum.OPENCTI)}
                {getButton(PlatformIdentifierEnum.OPENAEV)}
              </IconActionContext.Provider>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => {
              setOpenSheet(true);
              setPlatformIdentifier(availableTrials[0]!);
            }}
            className="bg-white text-black hover:bg-white text-[12px] px-s py-0.5 min-h-0 h-auto">
            {t('Service.Trials.StartTrial')}
            <ArrowRightAltIcon className="ml-s size-4" />
          </Button>
        )
      }>
      <TryFiligranProductForm
        handleSubmit={handleSubmit}
        handleCloseSheet={() => setOpenSheet(false)}
        deploymentRequestsAvailabilityQueryRef={
          deploymentRequestsAvailabilityQueryRef
        }
      />
    </SheetWithPreventingDialog>
  );
};
