'use client';
import { IconActionContext } from '@/components/ui/icon-actions';
import { KeyboardArrowRightIcon } from '@filigran/icon';
import {
  Callout,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface PublicTryFiligranProductsBannerProps {
  isOpenAEVTrialEnabled: boolean;
}
export function PublicTryFiligranProductsBanner({
  isOpenAEVTrialEnabled,
}: PublicTryFiligranProductsBannerProps) {
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);
  const bannerText = isOpenAEVTrialEnabled ? (
    <span>
      {t('Service.Trials.ExploreProducts')}{' '}
      <span className="font-bold">{t('Service.Trials.ExploreBold')}</span>
    </span>
  ) : (
    t('Service.Trials.Explore')
  );

  const getLink = (product: PlatformIdentifierEnum) => {
    return (
      <Link
        onClick={() => setMenuOpen(false)}
        href={
          product === PlatformIdentifierEnum.OPENCTI
            ? `/cybersecurity-solutions/opencti-free-trial`
            : `/cybersecurity-solutions/openaev-free-trial`
        }>
        <div className="flex flex-row h-9 px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-hover">
          <Image
            width="25"
            height="25"
            alt={'Product Logo'}
            src={
              product === PlatformIdentifierEnum.OPENCTI
                ? '/logo_opencti_dark.png'
                : '/logo_openaev_dark.png'
            }
            className="mr-s"
          />
          {product === PlatformIdentifierEnum.OPENCTI ? 'OpenCTI' : 'OpenAEV'}
        </div>
      </Link>
    );
  };

  return (
    <Callout className="rounded-none from-blue to-turquoise-300 bg-gradient-to-r text-black justify-center">
      {bannerText}
      {isOpenAEVTrialEnabled ? (
        <DropdownMenu
          open={menuOpen}
          onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <div className="flex flex-row items-center mr-xl">
              <Button
                className="ml-s mr-s text-[12px] px-2 py-0.5 min-h-0 h-auto"
                variant="outline"
                aria-expanded={menuOpen}
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
              {getLink(PlatformIdentifierEnum.OPENCTI)}
              {getLink(PlatformIdentifierEnum.OPENAEV)}
            </IconActionContext.Provider>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          href={`/cybersecurity-solutions/opencti-free-trial`}
          className="ml-xs underline font-bold">
          {t('Service.Trials.LearnMore.Link')}
        </Link>
      )}
    </Callout>
  );
}
