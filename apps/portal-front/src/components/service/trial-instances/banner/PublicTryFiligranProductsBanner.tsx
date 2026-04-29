'use client';
import { PlatformMetadataMapping } from '@/components/registration/platform-identifier-mapping';
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
import { IconActionContext } from '@/components/ui/IconActions';

export function PublicTryFiligranProductsBanner() {
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);
  const bannerText = (
    <span>
      {t('Service.Trials.ExploreProducts')}{' '}
      <span className="font-bold">{t('Service.Trials.ExploreBold')}</span>
    </span>
  );

  const getLink = (product: PlatformIdentifierEnum) => {
    return (
      <Link
        onClick={() => setMenuOpen(false)}
        href={PlatformMetadataMapping[product].learnMorePublicUrl}>
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
    <Callout className="rounded-none from-blue to-turquoise-300 bg-gradient-to-r text-black justify-center">
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
            {getLink(PlatformIdentifierEnum.OPENCTI)}
            {getLink(PlatformIdentifierEnum.OPENAEV)}
          </IconActionContext.Provider>
        </DropdownMenuContent>
      </DropdownMenu>
    </Callout>
  );
}
