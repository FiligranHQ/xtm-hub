'use client';
import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { Callout } from '@filigran/ui';
import { LearnMoreBannerButton } from './LearnMoreBannerButton';

import { useTolgee, useTranslate } from '@tolgee/react';

export const PublicTryFiligranProductsBanner = () => {
  const { t } = useTranslate();
  const { language: locale } = useTolgee(['language']);

  const bannerText = (
    <span>
      {t('Service_Trials_ExploreProducts')}{' '}
      <span className="font-bold">{t('Service_Trials_ExploreBold')}</span>
    </span>
  );
  return (
    <Callout
      className="rounded-none justify-center"
      style={{
        backgroundImage:
          'linear-gradient(to right, hsl(var(--blue-default)), hsl(var(--turquoise-300)))',
      }}>
      {bannerText}
      <LearnMoreBannerButton
        getHref={(product) =>
          `/${locale}${PlatformMetadataMapping[product].learnMorePublicUrl}`
        }
      />
    </Callout>
  );
};
