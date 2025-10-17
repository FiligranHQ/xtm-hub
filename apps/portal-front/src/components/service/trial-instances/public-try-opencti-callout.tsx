'use client';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { Callout } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function PublicTryOpenCTICallout() {
  const t = useTranslations();

  const isOpenCTIFreeTrialActivated = useIsFeatureEnabled(
    FeatureFlag.OPEN_CTI_FREE_TRIAL
  );
  return (
    isOpenCTIFreeTrialActivated && (
      <Callout
        variant="destructive"
        className="rounded-none from-blue to-turquoise-300 bg-gradient-to-r text-black justify-center uppercase">
        <div>
          {t('Service.Trials.Explore')} <b>{t('Service.Trials.FreeTrial')}</b>
          <Link
            href={`/redirect/free-trial`}
            className="ml-xs underline">
            {t('Service.Trials.LearnMore')}
          </Link>
        </div>
      </Callout>
    )
  );
}
