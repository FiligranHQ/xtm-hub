'use client';
import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { IconActionContext } from '@/components/ui/IconActions';
import { KeyboardArrowRightIcon } from '@filigran/icon';
import {
  Callout,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { PlatformIdentifier } from '@graphql/generated';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export const PublicTryFiligranProductsBanner = () => {
  const t = useTranslations();
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const bannerText = (
    <span>
      {t('Service.Trials.ExploreProducts')}{' '}
      <span className="font-bold">{t('Service.Trials.ExploreBold')}</span>
    </span>
  );

  const getLink = (product: PlatformIdentifier) => {
    return (
      <Link
        onClick={() => setMenuOpen(false)}
        href={`/${locale}${PlatformMetadataMapping[product].learnMorePublicUrl}`}>
        <div className="flex flex-row h-9 px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-hover">
          <Image
            width="25"
            height="25"
            alt={'Product Logo'}
            src={PlatformMetadataMapping[product].logoUrl}
            className="mr-s"
          />
          {PlatformMetadataMapping[product].name}
        </div>
      </Link>
    );
  };

  return (
    <Callout
      className="rounded-none text-black justify-center"
      style={{
        backgroundImage:
          'linear-gradient(to right, hsl(var(--blue-default)), hsl(var(--turquoise-300)))',
      }}>
      {bannerText}
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
            {getLink(PlatformIdentifier.Opencti)}
            {getLink(PlatformIdentifier.Openaev)}
          </IconActionContext.Provider>
        </DropdownMenuContent>
      </DropdownMenu>
    </Callout>
  );
};
