'use client';

import {
  PlatformMetadata,
  PlatformMetadataMapping,
} from '@/components/registration/platform-identifier-mapping';
import { UseTranslationsProps } from '@/i18n/config';
import { AddIcon } from '@filigran/icon';
import { Button } from '@filigran/ui';
import { PlatformIdentifier } from '@graphql/generated';
import Link from 'next/link';

interface ConnectPlatformButtonProps {
  platformIdentifier: PlatformIdentifier;
  t: UseTranslationsProps;
}

export const ConnectPlatformButton = ({
  platformIdentifier,
  t,
}: ConnectPlatformButtonProps) => {
  const meta: PlatformMetadata = PlatformMetadataMapping[platformIdentifier];

  return (
    <Button
      variant="outline"
      className="w-full text-primary bg-transparent justify-center gap-xs"
      asChild>
      <Link
        href={meta.docUrl}
        target="_blank"
        rel="noopener noreferrer">
        <span>
          {t('Header.ConnectedProducts.ConnectPlatform', {
            platformName: meta.name,
          })}
        </span>
        <AddIcon className="h-3 w-3" />
      </Link>
    </Button>
  );
};
