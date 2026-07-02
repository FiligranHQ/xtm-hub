'use client';

import { ConnectedProductItem } from '@/components/connected-products/ConnectedProductItem';
import { ConnectPlatformButton } from '@/components/connected-products/ConnectPlatformButton';
import { useConnectedPlatforms } from '@/components/connected-products/useConnectedPlatforms';
import { PortalContext } from '@/components/me/AppPortalContext';
import { ArrowDropDownIcon } from '@filigran/icon';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@filigran/ui';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { useTranslations } from 'next-intl';
import { useContext, useState } from 'react';

const CONNECTABLE_PLATFORMS = [
  PlatformIdentifierEnum.OPENCTI,
  PlatformIdentifierEnum.OPENAEV,
];

export const ConnectedProductsDropdown = () => {
  const t = useTranslations();
  const { isPersonalSpace } = useContext(PortalContext);
  const { connectedPlatforms } = useConnectedPlatforms();

  const [open, setOpen] = useState(false);

  if (isPersonalSpace) return null;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex flex-row items-center gap-xs text-primary font-medium">
          <span>
            {t('Header.ConnectedProducts.Count', {
              count: connectedPlatforms.length,
            })}
          </span>
          <ArrowDropDownIcon
            className={`h-5 w-5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0">
        {connectedPlatforms.length > 0 && (
          <>
            {connectedPlatforms.map((platform, index) => (
              <div key={platform.id}>
                <DropdownMenuItem className="p-0">
                  <ConnectedProductItem
                    platform={platform}
                    t={t}
                  />
                </DropdownMenuItem>
                {index < connectedPlatforms.length - 1 && (
                  <DropdownMenuSeparator className="bg-foreground/20" />
                )}
              </div>
            ))}
            <DropdownMenuSeparator className="bg-foreground/20" />
          </>
        )}
        <div className="flex flex-col gap-s p-m">
          {CONNECTABLE_PLATFORMS.map((platformId) => (
            <ConnectPlatformButton
              key={platformId}
              platformIdentifier={platformId}
              t={t}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
