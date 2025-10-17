'use client';

import { useTranslations } from 'next-intl';

import { StartTrialButton } from '@/components/service/trial-instances/start-trial-button';
import { SettingsContext } from '@/components/settings/env-portal-context';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { Callout } from 'filigran-ui';
import Link from 'next/link';
import { useContext } from 'react';

// Component
export const TryOpenCTICallout = ({}) => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);
  const isOpenCTIFreeTrialActivatedDEUX = useIsFeatureEnabled(
    FeatureFlag.OPEN_CTI_FREE_TRIAL
  );
  return (
    settings &&
    isOpenCTIFreeTrialActivatedDEUX && (
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
          <StartTrialButton />
        </div>
      </Callout>
    )
  );
};
