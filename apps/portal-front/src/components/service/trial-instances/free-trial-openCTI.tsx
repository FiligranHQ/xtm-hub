'use client';
import * as React from 'react';

import { useTranslations } from 'next-intl';

import { StartTrialButton } from '@/components/service/trial-instances/start-trial-button';
import { SettingsContext } from '@/components/settings/env-portal-context';
import { Callout } from 'filigran-ui';
import Link from 'next/link';
import { useContext } from 'react';
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
          <StartTrialButton />
        </div>
      </Callout>
    )
  );
};
