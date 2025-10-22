'use client';

import { useTranslations } from 'next-intl';

import {
  registerRegisteredPlatformListFragment,
  RegisterRegisteredPlatformsQuery,
} from '@/components/registration/register/register.graphql';
import { StartTrialButton } from '@/components/service/trial-instances/start-trial-button';
import { SettingsContext } from '@/components/settings/env-portal-context';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { DeploymentRequestStatusEnum } from '@generated/models/DeploymentRequestStatus.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { registerRegisteredPlatformListFragment$key } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { registerRegisteredPlatformsQuery } from '@generated/registerRegisteredPlatformsQuery.graphql';
import { ArrowRightAltIcon } from 'filigran-icon';
import { Callout } from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import Link from 'next/link';
import { useContext } from 'react';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

// Component
export const TryOpenCTICallout = ({}) => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);
  const isOpenCTIFreeTrialActivated = useIsFeatureEnabled(
    FeatureFlag.OPEN_CTI_FREE_TRIAL
  );

  const queryData = useLazyLoadQuery<registerRegisteredPlatformsQuery>(
    RegisterRegisteredPlatformsQuery,
    {
      input: {
        identifier: PlatformIdentifierEnum.OPENCTI,
      },
    }
  );

  const [data] = useRefetchableFragment<
    registerRegisteredPlatformsQuery,
    registerRegisteredPlatformListFragment$key
  >(registerRegisteredPlatformListFragment, queryData);

  const freeTrial = data.registeredPlatforms.filter(
    (platform) =>
      platform.deployment_request?.status ===
        DeploymentRequestStatusEnum.ACTIVE &&
      new Date(platform.subscription?.end_date) > new Date()
  );

  return (
    settings &&
    isOpenCTIFreeTrialActivated && (
      <Callout
        variant="destructive"
        className="rounded-none from-blue to-turquoise-300 bg-gradient-to-r text-black justify-center uppercase">
        <div>
          {t('Service.Trials.Explore')} <b>{t('Service.Trials.FreeTrial')}</b>
          <Link
            href={`${settings.base_url_front}/app/service/free-trial`}
            className="ml-xs underline">
            {t('Service.Trials.LearnMore')}
          </Link>
          {freeTrial.length === 1 ? (
            <Button
              className="ml-xl bg-white text-black hover:bg-white"
              asChild>
              <Link
                href={freeTrial[0]?.url ?? '/app'}
                target="_blank">
                {t('Service.Trials.GoToMyTrial')}
                <ArrowRightAltIcon className="ml-s size-4" />
              </Link>
            </Button>
          ) : (
            <StartTrialButton />
          )}
        </div>
      </Callout>
    )
  );
};
