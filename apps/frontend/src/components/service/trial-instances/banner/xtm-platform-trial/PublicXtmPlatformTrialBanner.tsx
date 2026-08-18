'use client';

import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { XtmPlatformTrialBanner } from '@/components/service/trial-instances/banner/xtm-platform-trial/XtmPlatformTrialBanner';
import { PlatformIdentifier } from '@graphql/generated';
import { useLocale } from 'next-intl';

export const PublicXtmPlatformTrialBanner = () => {
  const locale = useLocale();

  return (
    <XtmPlatformTrialBanner
      state="no-trial"
      learnMoreHref={`/${locale}${PlatformMetadataMapping[PlatformIdentifier.Opencti].learnMorePublicUrl}`}
    />
  );
};
