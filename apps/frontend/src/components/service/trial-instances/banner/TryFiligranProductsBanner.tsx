'use client';

import { useTranslations } from 'next-intl';

import GuardCapacityComponent from '@/components/AdminGuard';
import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { LearnMoreBannerButton } from '@/components/service/trial-instances/banner/LearnMoreBannerButton';
import { LearnMoreBannerLink } from '@/components/service/trial-instances/banner/LearnMoreBannerLink';
import { StartTrialBannerButton } from '@/components/service/trial-instances/banner/StartTrialBannerButton';
import { useOrgaFreeTrial } from '@/components/service/trial-instances/useOrgaFreeTrials';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import { Callout } from '@filigran/ui';
import { OrganizationCapability, PlatformIdentifier } from '@graphql/generated';
import { ReactNode, useContext } from 'react';

export const PRODUCTS_AVAILABLE_ON_TRIAL = 2;
type BannerConfig = {
  text: ReactNode;
  learnMore: ReactNode;
};

// Component
export const TryFiligranProductsBanner = () => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);
  const { availableTrials } = useOrgaFreeTrial();

  if (!settings) return null;

  if (availableTrials.length === 0) return null; // Dont display the banner if user already has the 2 products in trial

  const BANNER_TEXTS: Record<string, BannerConfig> = {
    default: {
      text: (
        <span>
          {t('Service.Trials.ExploreProducts')}{' '}
          <strong>{t('Service.Trials.ExploreBold')}</strong>
        </span>
      ),
      learnMore: (
        <LearnMoreBannerButton
          getHref={(product) =>
            `${settings.base_url_front}${PlatformMetadataMapping[product].learnMorePrivateUrl}`
          }
        />
      ),
    },
    openaev: {
      text: (
        <span>
          {t('Service.Trials.ExplorePlatform', {
            platformName:
              PlatformMetadataMapping[PlatformIdentifier.Openaev].name,
          })}{' '}
          <strong>{t('Service.Trials.ExploreBold')}</strong>
        </span>
      ),
      learnMore: (
        <LearnMoreBannerLink
          href={`${settings.base_url_front}${PlatformMetadataMapping[PlatformIdentifier.Openaev].learnMorePrivateUrl}`}
        />
      ),
    },
    opencti: {
      text: (
        <span>
          {t('Service.Trials.ExplorePlatform', {
            platformName:
              PlatformMetadataMapping[PlatformIdentifier.Opencti].name,
          })}{' '}
          <strong>{t('Service.Trials.ExploreBold')}</strong>
        </span>
      ),
      learnMore: (
        <LearnMoreBannerLink
          href={`${settings.base_url_front}${PlatformMetadataMapping[PlatformIdentifier.Opencti].learnMorePrivateUrl}`}
        />
      ),
    },
  };

  const banner: BannerConfig =
    BANNER_TEXTS[
      availableTrials.length === PRODUCTS_AVAILABLE_ON_TRIAL
        ? 'default'
        : (availableTrials[0] ?? 'default')
    ]!;

  return (
    <Callout
      className={`rounded-none from-blue to-turquoise-300 bg-gradient-to-r justify-center`}>
      <>{banner.text}</>
      <>{banner.learnMore}</>
      <GuardCapacityComponent
        shouldNotBePersonalSpace
        capacityRestriction={[
          OrganizationCapability.AdministrateOrganization,
          OrganizationCapability.ManagePlatformRegistration,
        ]}>
        <StartTrialBannerButton />
      </GuardCapacityComponent>
    </Callout>
  );
};
