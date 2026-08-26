'use client';

import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { IconActionContext } from '@/components/ui/IconActions';
import { useTranslate } from '@/hooks/use-translate';
import { KeyboardArrowRightIcon } from '@filigran/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { PlatformIdentifier } from '@graphql/generated';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface LearnMoreBannerButtonProps {
  getHref: (product: PlatformIdentifier) => string;
}

export const LearnMoreBannerButton = ({
  getHref,
}: LearnMoreBannerButtonProps) => {
  const t = useTranslate();
  const [menuOpen, setMenuOpen] = useState(false);

  const getLink = (product: PlatformIdentifier) => (
    <Link
      onClick={() => setMenuOpen(false)}
      href={getHref(product)}>
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

  return (
    <DropdownMenu
      open={menuOpen}
      onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className="ml-s mr-s text-[12px] px-2 py-0.5 min-h-0 h-auto text-inherit border-current hover:bg-current/10 focus-visible:ring-current/70"
          variant="secondary">
          {t('Service.Trials.LearnMore.Link')}
          <div
            className={`ml-s inline-flex transition-transform ${
              menuOpen ? 'rotate-90' : 'rotate-0'
            }`}>
            <KeyboardArrowRightIcon className="h-3 w-3" />
          </div>
        </Button>
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
  );
};
