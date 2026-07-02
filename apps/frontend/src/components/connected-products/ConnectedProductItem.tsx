'use client';

import { PlatformMetadataMapping } from '@/components/registration/platform-identifier-mapping';
import { UseTranslationsProps } from '@/i18n/config';
import { APP_PATH } from '@/utils/path/constant';
import { OpenInNewIcon, TextSnippetIcon } from '@filigran/icon';
import { Button } from '@filigran/ui';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { registerRegisteredPlatformFragment$data } from '@generated/registerRegisteredPlatformFragment.graphql';
import Image from 'next/image';
import Link from 'next/link';

interface ConnectedProductItemProps {
  platform: registerRegisteredPlatformFragment$data;
  t: UseTranslationsProps;
}

const identifierToPlatformIdentifier: Partial<
  Record<string, PlatformIdentifierEnum>
> = {
  [ServiceDefinitionIdentifierEnum.OPENCTI_REGISTRATION]:
    PlatformIdentifierEnum.OPENCTI,
  [ServiceDefinitionIdentifierEnum.OPENAEV_REGISTRATION]:
    PlatformIdentifierEnum.OPENAEV,
};

const platformRegistrationPaths: Record<PlatformIdentifierEnum, string> = {
  [PlatformIdentifierEnum.OPENCTI]: 'opencti_registration',
  [PlatformIdentifierEnum.OPENAEV]: 'openaev_registration',
};

export const ConnectedProductItem = ({
  platform,
  t,
}: ConnectedProductItemProps) => {
  const platformIdentifier = identifierToPlatformIdentifier[
    platform.identifier
  ] as PlatformIdentifierEnum | undefined;
  const platformMeta = platformIdentifier
    ? PlatformMetadataMapping[platformIdentifier]
    : undefined;
  const serviceInstanceId = platform.subscription?.service_instance?.id;
  const detailPath =
    platformIdentifier && serviceInstanceId
      ? `/${APP_PATH}/service/${platformRegistrationPaths[platformIdentifier]}/${serviceInstanceId}`
      : undefined;

  return (
    <div className="flex w-full items-center justify-between gap-m px-m py-s">
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
            variant="outline"
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
            variant="outline"
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
