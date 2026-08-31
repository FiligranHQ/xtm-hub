'use client';

import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { useTranslate } from '@/hooks/use-translate';
import { Callout } from '@filigran/ui';
import { useLocale } from 'next-intl';
import { LearnMoreBannerButton } from './LearnMoreBannerButton';

export const PublicTryFiligranProductsBanner = () => {
  const t = useTranslate();
  const locale = useLocale();

  const bannerText = (
    <span>
      {t('Service.Trials.ExploreProducts')}{' '}
      <span className="font-bold">{t('Service.Trials.ExploreBold')}</span>
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
