import { APP_PATH } from '@/utils/path/constant';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import { DeploymentRequestDeploymentTypeEnum } from '@generated/models/DeploymentRequestDeploymentType.enum';
import { DeploymentRequestHubStatusEnum } from '@generated/models/DeploymentRequestHubStatus.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { registerRegisteredPlatformListFragment$data } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { useTranslations } from 'next-intl';
import { PlatformHoverAction } from '@/components/service/ServiceInstanceCard';

export const getPlatformIdentifier = (type: string): PlatformIdentifierEnum => {
  return type === ShareableResourceType.OPENAEV_SCENARIO
    ? PlatformIdentifierEnum.OPENAEV
    : PlatformIdentifierEnum.OPENCTI;
};

export const isTrial = (
  platform: registerRegisteredPlatformListFragment$data['registeredPlatforms'][number]
) => {
  return (
    platform.deployment_request?.type ===
    DeploymentRequestDeploymentTypeEnum.TRIAL
  );
};

export const buildPlatformHoverLinks = (
  platform: registerRegisteredPlatformListFragment$data['registeredPlatforms'][number],
  t: ReturnType<typeof useTranslations>
): PlatformHoverAction[] | undefined => {
  const isTrialActive =
    platform.deployment_request?.hub_status ===
    DeploymentRequestHubStatusEnum.ACTIVE;
  const shouldDisplayPlatformLink = isTrialActive || !isTrial(platform);

  const actions: PlatformHoverAction[] = [
    {
      id: 'platform-details',
      label: t('Service.RegisteredPlatforms.PlatformDetails'),
      href: `/${APP_PATH}/service/${platform.identifier}/${platform.subscription?.service_instance?.id}`,
      variant: 'outline-primary',
    },
  ];
  if (shouldDisplayPlatformLink) {
    actions.push({
      id: 'platform-link',
      label: t('Service.RegisteredPlatforms.GoToMyPlatform'),
      href: platform.url,
      target: '_blank',
    });
  }

  return actions;
};
