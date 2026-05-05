import { ServiceDefinitionIdentifierToPlatformIdentifier } from '@/components/registration/platform-identifier-mapping';
import { ServiceInstanceCardData } from '@/components/service/ServiceInstanceCard';
import { daysUntil } from '@/utils/date';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { buildPlatformHoverLinks, isTrial } from '@/utils/platform';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import { DeploymentRequestHubStatusEnum } from '@generated/models/DeploymentRequestHubStatus.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceInstanceCreationStatusEnum } from '@generated/models/ServiceInstanceCreationStatus.enum';
import { registerRegisteredPlatformListFragment$data } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { useTranslations } from 'next-intl';

export const isExternalService = (
  service_definition_identifier: ServiceDefinitionIdentifierEnum
) =>
  [
    ServiceDefinitionIdentifierEnum.LINK,
    ServiceDefinitionIdentifierEnum.OPENCTI_REGISTRATION,
    ServiceDefinitionIdentifierEnum.OPENAEV_REGISTRATION,
  ].includes(service_definition_identifier);

export const platformIdentifierMappedByShareableResourceType: Record<
  ShareableResourceType,
  PlatformIdentifierEnum
> = {
  [ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD]:
    PlatformIdentifierEnum.OPENCTI,
  [ShareableResourceType.OPENCTI_INTEGRATION]: PlatformIdentifierEnum.OPENCTI,
  [ShareableResourceType.OPENAEV_SCENARIO]: PlatformIdentifierEnum.OPENAEV,
};

export const isExpired = (endDate: Date | undefined | null): boolean => {
  return endDate ? new Date(endDate) < new Date() : false;
};

export const getDisplayDays = (
  platform: registerRegisteredPlatformListFragment$data['registeredPlatforms'][number]
) => {
  if (!isTrial(platform)) {
    return undefined;
  }

  if (
    !platform.subscription?.end_date ||
    [
      DeploymentRequestHubStatusEnum.EXPIRED,
      DeploymentRequestHubStatusEnum.CANCELLED,
    ].includes(
      platform.deployment_request?.hub_status as DeploymentRequestHubStatusEnum
    )
  ) {
    return platform.deployment_request?.hub_status;
  }

  if (
    platform.deployment_request?.hub_status ===
    DeploymentRequestHubStatusEnum.QUEUED
  ) {
    return 'Requested';
  }
  if (
    platform.subscription?.service_instance?.creation_status ===
    ServiceInstanceCreationStatusEnum.PENDING
  ) {
    return 'Provisioning';
  }

  const target = new Date(platform.subscription?.end_date);

  const diffInDays = daysUntil(target);
  if (diffInDays <= 0) {
    return 'Expired';
  }
  return `${diffInDays} days remaining`;
};

const buildDocumentUrl = (
  serviceInstanceId: string,
  logoDocumentId: string | null | undefined
) => {
  if (logoDocumentId)
    return `url(/document/images/${serviceInstanceId}/${logoDocumentId})`;
  return null;
};

const freeTrialStaticData = (
  platformIdentifier: PlatformIdentifierEnum,
  t: ReturnType<typeof useTranslations>
) => {
  return {
    description: t(
      `Service.Trials.Display.${platformIdentifier}.FreeTrialDescription`
    ),
    name: t(`Service.Trials.Display.${platformIdentifier}.Title`),
    logoBackgroundImageUrl: `url(/${platformIdentifier}_free-trial-logo.png)`,
    illustrationDocumentUrl: `/opencti_free-trial-illustration.png`,
    ordering: -2,
  };
};

export const freeTrialSkeletonToServiceInstanceCardData = (
  platformIdentifier: PlatformIdentifierEnum,
  t: ReturnType<typeof useTranslations>
) => {
  const page =
    platformIdentifier === PlatformIdentifierEnum.OPENAEV
      ? 'openaev-free-trial'
      : 'opencti-free-trial';

  return {
    ...freeTrialStaticData(platformIdentifier, t),
    id: 'freeTrial',
    displayedServiceStatus: t('Service.Trials.Display.New'),
    url: `/app/service/${page}`,
  };
};

export const registeredPlatformToServiceInstanceCardData = (
  platform: registerRegisteredPlatformListFragment$data['registeredPlatforms'][number],
  t: ReturnType<typeof useTranslations>
): ServiceInstanceCardData => {
  const cardBackgroundByServiceMap: Partial<
    Record<ServiceDefinitionIdentifierEnum, string>
  > = {
    [ServiceDefinitionIdentifierEnum.OPENCTI_REGISTRATION]:
      'bg-gradient-to-br from-[#05105A] via-[#095298] to-[#05105A]',
    [ServiceDefinitionIdentifierEnum.OPENAEV_REGISTRATION]:
      'bg-gradient-to-br from-[#0F1E38] via-[#0A6D6A] to-[#0F1E38]',
  };
  const platformIdentifier =
    platform.identifier as ServiceDefinitionIdentifierEnum;
  const commonValues = {
    id: platform.id,
    url: platform.url,
    disableCard:
      [
        DeploymentRequestHubStatusEnum.EXPIRED,
        DeploymentRequestHubStatusEnum.CANCELLED,
      ].includes(
        platform.deployment_request
          ?.hub_status as DeploymentRequestHubStatusEnum
      ) || isExpired(platform.subscription?.end_date),
    hoverLinks: buildPlatformHoverLinks(platform, t),
  };
  if (isTrial(platform)) {
    return {
      ...commonValues,
      ...freeTrialStaticData(
        ServiceDefinitionIdentifierToPlatformIdentifier[platformIdentifier] ??
          PlatformIdentifierEnum.OPENCTI,
        t
      ),
      displayedServiceStatus: getDisplayDays(platform),
    };
  }

  return {
    ...commonValues,
    name: platform.title,
    description: t('Register.Details.Description'),
    illustrationDocumentUrl: platform.illustration_document_id
      ? `/document/visualize/${platform.id}/${platform.illustration_document_id}`
      : `/${platformIdentifier}-private-platform-illustration.png`,
    isCustomIllustrationDocument: !!platform.illustration_document_id,
    logoBackgroundImageUrl: `url(/${platformIdentifier}-private-platform-logo.png)`,
    fullBackgroundImage: true,
    cardTitleOverride: `${platform.title} - ${t('Register.Details.PrivatePlatform')}`,
    card_background: cardBackgroundByServiceMap[platformIdentifier] ?? null,
    ordering: -1, // registered platforms are displayed at the first position, after free trials
  };
};

const computeUrl = (
  instance: serviceList_fragment$data | seoServiceInstanceFragment$data,
  seo?: boolean
) => {
  const instanceLink = instance.links?.[0]?.url;
  const serviceDefinitionIdentifier = instance.service_definition!
    .identifier as ServiceDefinitionIdentifierEnum;
  if (isExternalService(serviceDefinitionIdentifier) && instanceLink)
    return instanceLink as string;
  if (seo) {
    return `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${instance.slug}`;
  }
  return `/${APP_PATH}/service/${serviceDefinitionIdentifier}/${instance.id}`;
};

const computeIllustrationDocumentUrl = (
  instanceId: string,
  illustrationDocumentId: string | null | undefined
) => {
  if (illustrationDocumentId)
    return `/document/images/${instanceId}/${illustrationDocumentId}`;
  return null;
};

export const publicServiceInstanceToInstanceCardData = (
  instance: serviceList_fragment$data
): ServiceInstanceCardData => {
  return {
    id: instance.id,
    isLinkDisabled:
      instance.creation_status === ServiceInstanceCreationStatusEnum.PENDING,
    name: instance.name,
    description: instance.description!,
    displayLinkArrow: isExternalService(
      instance.service_definition!.identifier as ServiceDefinitionIdentifierEnum
    ),
    illustrationDocumentUrl: computeIllustrationDocumentUrl(
      instance.id,
      instance.illustration_document_id
    ),
    logoBackgroundImageUrl: buildDocumentUrl(
      instance.id,
      instance.logo_document_id
    ),
    url: computeUrl(instance),
    ordering: instance.ordering,
  };
};

export const seoServiceInstanceToInstanceCardData = (
  instance: seoServiceInstanceFragment$data
): ServiceInstanceCardData => {
  return {
    id: instance.id,
    name: instance.name,
    slug: instance.slug as string,
    description: instance.description!,
    displayLinkArrow: isExternalService(
      instance.service_definition!.identifier as ServiceDefinitionIdentifierEnum
    ),
    illustrationDocumentUrl: computeIllustrationDocumentUrl(
      instance.id,
      instance.illustration_document_id
    ),
    logoBackgroundImageUrl: buildDocumentUrl(
      instance.id,
      instance.logo_document_id
    ),
    url: computeUrl(instance, true),
    ordering: 0,
  };
};
