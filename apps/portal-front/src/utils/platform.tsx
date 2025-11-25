import { APP_PATH } from '@/utils/path/constant';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import { DeploymentRequestStatusEnum } from '@generated/models/DeploymentRequestStatus.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { registerRegisteredPlatformListFragment$data } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

export const getPlatformIdentifier = (type: string): PlatformIdentifierEnum => {
  return type === ShareableResourceType.OPENAEV_SCENARIO
    ? PlatformIdentifierEnum.OPENAEV
    : PlatformIdentifierEnum.OPENCTI;
};

export const buildPlatformHoverLinks = (
  platform: registerRegisteredPlatformListFragment$data['registeredPlatforms'][number]
): React.ReactNode | undefined => {
  const t = useTranslations();

  return (
    <>
      <Button variant="outline-primary">
        <Link
          href={`/${APP_PATH}/service/${platform.identifier}/${platform.subscription?.service_instance?.id}`}>
          {t('Service.RegisteredPlatforms.PlatformDetails')}
        </Link>
      </Button>
      {platform.deployment_request?.status ===
        DeploymentRequestStatusEnum.ACTIVE && (
        <Button>
          <Link
            target="_blank"
            href={platform.url}>
            {t('Service.RegisteredPlatforms.GoToMyPlatform')}
          </Link>
        </Button>
      )}
    </>
  );
};
