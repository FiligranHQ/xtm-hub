'use client';
import * as React from 'react';

import { ArrowRightAltIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import GuardCapacityComponent from '@/components/admin-guard';
import { CreateDeploymentRequestMutation } from '@/components/service/trial-instances/create-deployment.graphql';
import {
  TryOpenCTIForm,
  tryOpenCTIFormSchema,
} from '@/components/service/trial-instances/try-opencti-form';
import { SettingsContext } from '@/components/settings/env-portal-context';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { createDeploymentRequestMutation } from '@generated/createDeploymentRequestMutation.graphql';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { Callout } from 'filigran-ui';
import { toast } from 'filigran-ui/clients';
import Link from 'next/link';
import { useContext } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
// Component interface
interface TryOpenCTIProps {
  isOpenCTIFreeTrialActivated: boolean;
}

// Component
export const FreeTrialOpenCTI: React.FunctionComponent<TryOpenCTIProps> = ({
  isOpenCTIFreeTrialActivated,
}) => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);
  const [openSheet, setOpenSheet] = useState(false);
  const [commitCreateDeploymentRequestMutationMutation] =
    useMutation<createDeploymentRequestMutation>(
      CreateDeploymentRequestMutation
    );
  const handleSubmit = (values: z.infer<typeof tryOpenCTIFormSchema>) => {
    setOpenSheet(false);
    const { acceptTerms: _, ...valuesWithoutAcceptTerms } = values;
    commitCreateDeploymentRequestMutationMutation({
      variables: {
        input: {
          ...valuesWithoutAcceptTerms,
          platform_identifier: PlatformIdentifierEnum.OPENCTI,
          type: 'trial',
        },
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
    settings &&
    isOpenCTIFreeTrialActivated && (
      <Callout
        variant="destructive"
        className="rounded-none from-blue to-turquoise-300 bg-gradient-to-r text-black justify-center uppercase">
        <div className="">
          {t('Service.Trials.Explore')} <b>{t('Service.Trials.FreeTrial')}</b>
          <Link
            href={`${settings.base_url_front}/app/service/free-trial`}
            className="ml-xs underline">
            {t('Service.Trials.LearnMore')}
          </Link>
          <SheetWithPreventingDialog
            title={t('Service.Trials.StartTrial')}
            setOpen={setOpenSheet}
            open={openSheet}
            trigger={
              <GuardCapacityComponent
                capacityRestriction={[
                  OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
                  OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
                ]}>
                <Button
                  onClick={() => setOpenSheet(true)}
                  className="ml-xl bg-white text-black hover:bg-white">
                  {t('Service.Trials.StartTrial')}
                  <ArrowRightAltIcon className="ml-s size-4" />
                </Button>
              </GuardCapacityComponent>
            }>
            <TryOpenCTIForm
              handleSubmit={handleSubmit}
              handleCloseSheet={() => setOpenSheet(false)}
            />
          </SheetWithPreventingDialog>
        </div>
      </Callout>
    )
  );
};
