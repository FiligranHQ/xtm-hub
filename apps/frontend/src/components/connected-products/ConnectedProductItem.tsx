'use client';

import { ConnectedPlatform } from '@/components/connected-products/useConnectedPlatforms';
import {
  PlatformMetadataMapping,
  ServiceDefinitionIdentifierToPlatformIdentifier,
} from '@/components/registration/PlatformIdentifierMapping';
import { UseTranslationsProps } from '@/i18n/config';
import { APP_PATH } from '@/utils/path/constant';
import { OpenInNewIcon, TextSnippetIcon } from '@filigran/icon';
import { Button } from '@filigran/ui';
import Image from 'next/image';
import Link from 'next/link';

interface ConnectedProductItemProps {
  platform: ConnectedPlatform;
  t: UseTranslationsProps;
}

export const ConnectedProductItem = ({
  platform,
  t,
}: ConnectedProductItemProps) => {
  const platformIdentifier =
    ServiceDefinitionIdentifierToPlatformIdentifier[platform.identifier];
  const platformMeta = platformIdentifier
    ? PlatformMetadataMapping[platformIdentifier]
    : undefined;
  const serviceInstanceId = platform.subscription?.service_instance?.id;
  const detailPath = serviceInstanceId
    ? `/${APP_PATH}/service/${platform.identifier}/${serviceInstanceId}`
    : undefined;

  return (
    <div className="hover:cursor-default flex min-h-12 w-full items-center justify-between gap-m px-m py-s">
      <div className="flex items-center gap-s">
        {platformMeta?.logoUrl && (
          <Image
            src={platformMeta.logoUrl}
            alt={platformMeta.name}
            width={20}
            height={20}
            className="shrink-0 brightness-0 dark:brightness-0 dark:invert"
          />
        )}
        <span className="text-sm font-medium">
          {platform.title ?? platformMeta?.name ?? platform.identifier}
        </span>
      </div>
      <div className="flex items-center gap-xs">
        {detailPath && (
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            asChild>
            <Link
              href={detailPath}
              aria-label={t('Header.ConnectedProducts.Details')}>
              <TextSnippetIcon className="h-4 w-4" />
            </Link>
          </Button>
        )}
        {platform.url && (
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            asChild>
            <Link
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('Header.ConnectedProducts.GoToPlatform', {
                title:
                  platform.title ?? platformMeta?.name ?? platform.identifier,
              })}>
              <OpenInNewIcon className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
