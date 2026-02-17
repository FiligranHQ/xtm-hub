'use client';

import { useTranslations } from 'next-intl';

import GuardCapacityComponent from '@/components/admin-guard';
import { StartTrialButton } from '@/components/service/trial-instances/start-trial-button';
import { useFreeTrial } from '@/components/service/trial-instances/useFreeTrials';
import { SettingsContext } from '@/components/settings/env-portal-context';
import { daysUntil } from '@/utils/date';
import { ArrowRightAltIcon } from '@filigran/icon';
import { Callout } from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { DeploymentRequestHubStatusEnum } from '@generated/models/DeploymentRequestHubStatus.enum';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceInstanceCreationStatusEnum } from '@generated/models/ServiceInstanceCreationStatus.enum';
import Link from 'next/link';
import { useContext } from 'react';
import { ReachSalesButton } from './reach-sales/reach-sales-button';

// Component
export const TryOpenCTIBanner = () => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);

  if (!settings) return null;

  const { freeTrial } = useFreeTrial();

  const target = new Date(freeTrial?.subscription?.end_date);

  const diffInDays = daysUntil(target);

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
      className="ml-xl bg-white text-black hover:bg-white text-[12px] px-2 py-0.5 min-h-0 h-auto"
      asChild>
      <Link
        href={trialUrl}
        target="_blank">
        {t('Service.Trials.GoToMyTrial')}
        <ArrowRightAltIcon className="ml-s size-4" />
      </Link>
    </Button>
  );

  const LearnMoreLink = () => (
    <Link
      href={`${settings.base_url_front}/app/service/free-trial`}
      className="ml-xs underline font-bold">
      {t('Service.Trials.LearnMore.Link')}
    </Link>
  );

  const CONTENT_CONFIG = {
    noTrial: {
      text: () => (
        <>
          {t('Service.Trials.Explore')}
          <LearnMoreLink />
        </>
      ),
      button: () => (
        <GuardCapacityComponent
          shouldNotBePersonalSpace
          capacityRestriction={[
            OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
            OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
          ]}>
          <div className="ml-xl">
            <StartTrialButton />
          </div>
        </GuardCapacityComponent>
      ),
    },
    queued: {
      text: () => (
        <>
          {t('Service.Trials.Requested')}
          <LearnMoreLink />
        </>
      ),
      button: () => <></>,
    },
    provisioning: {
      text: () => (
        <>
          {t('Service.Trials.Provisioning')}
          <LearnMoreLink />
        </>
      ),
      button: () => <></>,
    },
    expired: {
      text: () => t('Service.Trials.Expired'),
      button: () => (
        <ReachSalesButton
          variant="default"
          platformIdentifier={PlatformIdentifierEnum.OPENCTI}
        />
      ),
    },
    cancelled: {
      text: () => t('Service.Trials.Cancelled'),
      button: () => (
        <ReachSalesButton
          variant="default"
          platformIdentifier={PlatformIdentifierEnum.OPENCTI}
        />
      ),
    },
    active: {
      text: () => (
        <>
          {t('Service.Trials.Active')}:{' '}
          <strong>
            {t('Service.Trials.DaysRemaining', { days: diffInDays })}
          </strong>
        </>
      ),
      button: () => goToTrialButton(),
    },
  };

  const getContentKey = () => {
    if (!freeTrial) return 'noTrial';
    if (
      freeTrial?.deployment_request?.hub_status ===
      DeploymentRequestHubStatusEnum.QUEUED
    ) {
      return 'queued';
    }

    if (
      freeTrial?.deployment_request?.hub_status ===
      DeploymentRequestHubStatusEnum.CANCELLED
    ) {
      return 'cancelled';
    }

    if (
      freeTrial?.subscription?.service_instance?.creation_status ===
      ServiceInstanceCreationStatusEnum.PENDING
    )
      return 'provisioning';
    if (
      diffInDays <= 0 ||
      freeTrial?.deployment_request?.hub_status ===
        DeploymentRequestHubStatusEnum.EXPIRED
    )
      return 'expired';
    return 'active';
  };

  const content = CONTENT_CONFIG[getContentKey()];
  return (
    <Callout
      variant="destructive"
      className={`rounded-none ${getGradientClass(diffInDays)} text-black justify-center`}>
      {content.text()}
      {content.button()}
    </Callout>
  );
};
