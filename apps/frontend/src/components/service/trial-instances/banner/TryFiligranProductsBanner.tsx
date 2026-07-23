'use client';

import { useTranslations } from 'next-intl';

import GuardCapacityComponent from '@/components/AdminGuard';
import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { StartTrialBannerButton } from '@/components/service/trial-instances/banner/StartTrialBannerButton';
import { useOrgaFreeTrial } from '@/components/service/trial-instances/useOrgaFreeTrials';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import { IconActionContext } from '@/components/ui/IconActions';
import { KeyboardArrowRightIcon } from '@filigran/icon';
import {
  Callout,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { OrganizationCapability, PlatformIdentifier } from '@graphql/generated';
import Image from 'next/image'; // Component
import Link from 'next/link';
import { ReactNode, useContext, useState } from 'react';

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

  const [menuOpen, setMenuOpen] = useState(false);

  if (!settings) return null;

  if (availableTrials.length === 0) return null; // Dont display the banner if user already has the 2 products in trial

  const getLink = (product: PlatformIdentifier) => {
    return (
      <Link
        onClick={() => setMenuOpen(false)}
        href={`${settings!.base_url_front}${PlatformMetadataMapping[product].learnMorePrivateUrl}`}>
        <div className="flex flex-row h-9 px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-hover">
          <Image
            width="25"
            height="25"
            alt={'Product Logo'}
            src={PlatformMetadataMapping[product].logoUrl}
            className="mr-s object-contain"
          />
          {PlatformMetadataMapping[product].name}
        </div>
      </Link>
    );
  };

  const BANNER_TEXTS: Record<string, BannerConfig> = {
    default: {
      text: (
        <span>
          {t('Service.Trials.ExploreProducts')}{' '}
          <strong>{t('Service.Trials.ExploreBold')}</strong>
        </span>
      ),
      learnMore: (
        <DropdownMenu
          open={menuOpen}
          onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <div className="ml-xs mr-xs flex flex-row items-center">
              <Button
                className="ml-s mr-s text-[12px] px-2 py-0.5 min-h-0 h-auto"
                variant="secondary"
                onClick={() => setMenuOpen}>
                {t('Service.Trials.LearnMore.Link')}
                <div
                  className={`ml-s inline-flex transition-transform ${
                    menuOpen ? 'rotate-90' : 'rotate-0'
                  }`}>
                  <KeyboardArrowRightIcon className="h-3 w-3" />
                </div>
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-full flex flex-col">
            <IconActionContext.Provider value={{ setMenuOpen }}>
              {getLink(PlatformIdentifier.Opencti)}
              {getLink(PlatformIdentifier.Openaev)}
            </IconActionContext.Provider>
          </DropdownMenuContent>
        </DropdownMenu>
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
        <Link
          href={`${settings!.base_url_front}${PlatformMetadataMapping[PlatformIdentifier.Openaev].learnMorePrivateUrl}`}
          className="ml-xs mr-s underline font-bold">
          {t('Service.Trials.LearnMore.Link')}
        </Link>
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
        <Link
          href={`${settings!.base_url_front}${PlatformMetadataMapping[PlatformIdentifier.Opencti].learnMorePrivateUrl}`}
          className="ml-xs mr-s underline font-bold">
          {t('Service.Trials.LearnMore.Link')}
        </Link>
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
      className={`rounded-none from-blue to-turquoise-300 bg-gradient-to-r text-black justify-center`}>
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
