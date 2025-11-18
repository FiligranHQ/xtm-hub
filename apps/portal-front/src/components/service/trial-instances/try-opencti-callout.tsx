'use client';

import { useTranslations } from 'next-intl';

import { StartTrialButton } from '@/components/service/trial-instances/start-trial-button';
import { useFreeTrial } from '@/components/service/trial-instances/useFreeTrials';
import { SettingsContext } from '@/components/settings/env-portal-context';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { DeploymentRequestStatusEnum } from '@generated/models/DeploymentRequestStatus.enum';
import { ArrowRightAltIcon } from 'filigran-icon';
import { Callout } from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import Link from 'next/link';
import { useContext } from 'react';

// Component
export const TryOpenCTICallout = ({}) => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);
  const isOpenCTIFreeTrialActivated = useIsFeatureEnabled(
    FeatureFlag.OPEN_CTI_FREE_TRIAL
  );
  if (!settings || !isOpenCTIFreeTrialActivated) return null;

  const { freeTrial } = useFreeTrial();

  const target = new Date(freeTrial?.subscription?.end_date);
  const now = new Date();

  const diffInMs = target.getTime() - now.getTime();

  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  const GRADIENT_CLASSES = {
    default: 'from-blue to-turquoise-300 bg-gradient-to-r',
    warning: 'from-yellow-300 to-orange bg-gradient-to-r',
    info: 'from-turquoise to-yellow-300 bg-gradient-to-r',
  };

  const getGradientClass = (days: number): string => {
    if (freeTrial?.subscription?.end_date < new Date()) {
      return GRADIENT_CLASSES.default;
    }

    if (days <= 8) return GRADIENT_CLASSES.warning;
    if (days <= 22) return GRADIENT_CLASSES.info;
    return GRADIENT_CLASSES.default;
  };

  const trialUrl = freeTrial?.url ?? '/app';

  const goToTrialButton = () => (
    <Button
      className="ml-xl bg-white text-black hover:bg-white"
      asChild>
      <Link
        href={trialUrl}
        target="_blank">
        {t('Service.Trials.GoToMyTrial')}
        <ArrowRightAltIcon className="ml-s size-4" />
      </Link>
    </Button>
  );

  const reachSalesButton = () => (
    <Button
      className="ml-xl bg-white text-black hover:bg-white"
      asChild>
      <Link
        href={trialUrl}
        target="_blank">
        {t('Service.Trials.ReachSales')}
        <ArrowRightAltIcon className="ml-s size-4" />
      </Link>
    </Button>
  );

  const CONTENT_CONFIG = {
    noTrial: {
      text: () => (
        <>
          {t('Service.Trials.Explore')} <b>{t('Service.Trials.FreeTrial')}</b>
          <Link
            href={`${settings.base_url_front}/app/service/free-trial`}
            className="ml-xs underline">
            {t('Service.Trials.LearnMore')}
          </Link>
        </>
      ),
      button: () => <StartTrialButton />,
    },
    queued: {
      text: () => (
        <>
          {t('Service.Trials.Provisioning')}{' '}
          <b>{t('Service.Trials.Requested')}</b>
          <Link
            href={`${settings.base_url_front}/app/service/free-trial`}
            className="ml-xs underline">
            {t('Service.Trials.LearnMore')}
          </Link>
        </>
      ),
      button: () => <></>,
    },
    provisioning: {
      text: () => (
        <>
          {t('Service.Trials.Provisioning')}{' '}
          <b>{t('Service.Trials.ProvisioningBold')}</b>
        </>
      ),
      button: () => <></>,
    },
    expired: {
      text: () => t('Service.Trials.Expired'),
      button: () => reachSalesButton(),
    },
    active: {
      text: () => (
        <>
          {t('Service.Trials.Active')}:{' '}
          <b>{t('Service.Trials.DaysRemaning', { days: diffInDays })}</b>
        </>
      ),
      button: () => goToTrialButton(),
    },
  };

  const getContentKey = () => {
    if (!freeTrial) return 'noTrial';
    if (
      freeTrial?.deployment_request?.status ===
      DeploymentRequestStatusEnum.QUEUED
    ) {
      return 'queued';
    }

    if (
      freeTrial?.subscription?.service_instance?.creation_status === 'PENDING'
    )
      return 'provisioning';
    if (diffInDays <= 0) return 'expired';
    return 'active';
  };

  const content = CONTENT_CONFIG[getContentKey()];

  return (
    <Callout
      variant="destructive"
      className={`rounded-none ${getGradientClass(diffInDays)} text-black justify-center uppercase`}>
      <div>
        {content.text()}
        {content.button()}
      </div>
    </Callout>
  );
};
