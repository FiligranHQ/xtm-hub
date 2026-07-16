'use client';

import {
  PlatformMetadata,
  PlatformMetadataMapping,
} from '@/components/registration/PlatformIdentifierMapping';
import { AddIcon } from '@filigran/icon';
import { Button } from '@filigran/ui';
import { PlatformIdentifier } from '@graphql/generated';
import { useState } from 'react';

import ConnectProductFromHubModal, {
  ConnectProductOriginEnum,
} from '@/components/registration/registerFromHub/ConnectProductFromHubModal';
import { useTranslations } from 'next-intl';

interface ConnectProductButtonProps {
  platformIdentifier: PlatformIdentifier;
  onCloseDropdown?: () => void;
}

export const ConnectProductButton = ({
  platformIdentifier,
  onCloseDropdown,
}: ConnectProductButtonProps) => {
  const t = useTranslations();

  const meta: PlatformMetadata = PlatformMetadataMapping[platformIdentifier];
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        variant="outline-primary"
        className="hover:cursor-pointer w-full text-primary bg-transparent justify-center gap-xs"
        onClick={() => {
          setIsOpen(true);
        }}>
        <span>
          {t('Header.ConnectedProducts.ConnectPlatform', {
            platformName: meta.name,
          })}
        </span>
        <AddIcon className="h-3 w-3" />
      </Button>
      <ConnectProductFromHubModal
        isOpen={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            onCloseDropdown?.();
          }
        }}
        product={meta.name}
        origin={ConnectProductOriginEnum.homepage}
      />
    </>
  );
};
