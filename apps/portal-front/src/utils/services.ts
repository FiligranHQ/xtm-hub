import { ServiceInstanceCardData } from '@/components/service/service-instance-card';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { DeploymentTypeEnum } from '@generated/models/DeploymentType.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceInstanceCreationStatusEnum } from '@generated/models/ServiceInstanceCreationStatus.enum';
import { registerRegisteredPlatformListFragment$data } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '@generated/userServicesOwned_fragment.graphql';
import { useTranslations } from 'next-intl';

export const isExternalService = (
  service_definition_identifier: ServiceDefinitionIdentifierEnum
) =>
  [
    ServiceDefinitionIdentifierEnum.LINK,
    ServiceDefinitionIdentifierEnum.OPENCTI_REGISTRATION,
    ServiceDefinitionIdentifierEnum.OPENAEV_REGISTRATION,
  ].includes(service_definition_identifier);

export const isRegistrationService = (
  serviceInstance: ServiceInstanceCardData
) =>
  [
    ServiceDefinitionIdentifierEnum.OPENCTI_REGISTRATION,
    ServiceDefinitionIdentifierEnum.OPENAEV_REGISTRATION,
  ].includes(
    serviceInstance.service_definition_identifier as ServiceDefinitionIdentifierEnum
  );

const isTrial = (
  platform: registerRegisteredPlatformListFragment$data['registeredPlatforms'][number]
) => {
  return platform.deployment_request?.type === DeploymentTypeEnum.TRIAL;
};

export const isExpired = (serviceInstance: ServiceInstanceCardData) =>
  serviceInstance.end_date && new Date(serviceInstance.end_date) < new Date();

export const getDisplayDays = (
  platform: registerRegisteredPlatformListFragment$data['registeredPlatforms'][number]
) => {
  if (!isTrial) {
    return undefined;
  }
  if (
    platform.subscription?.service_instance?.creation_status ===
    ServiceInstanceCreationStatusEnum.PENDING
  ) {
    return 'Provisioning';
  }
  if (!platform.subscription?.end_date) {
    return platform.deployment_request?.status;
  }
  const target = new Date(platform.subscription?.end_date);
  const now = new Date();

  const diffInMs = target.getTime() - now.getTime();

  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
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

export const registeredPlatformToServiceInstanceCardData = (
  platform: registerRegisteredPlatformListFragment$data['registeredPlatforms'][number]
): ServiceInstanceCardData => {
  const t = useTranslations();
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
  return {
    id: platform.id,
    isDisabled: false,
    name: platform.title,
    description: t('Register.Details.Description'),
    displayedServiceStatus: getDisplayDays(platform),
    displayLinkArrow: !isTrial(platform),
    displayUpdatePlatformIfAllowed: !isTrial(platform),
    illustration_document_id: platform.illustration_document_id
      ? platform.illustration_document_id
      : null,
    logoBackgroundImageUrl: `url(/${platformIdentifier}-private-platform-logo.png)`,
    fullBackgroundImage: true,
    cardTitleOverride: `${platform.title} - ${t('Register.Details.PrivatePlatform')}`,
    service_definition_identifier: platformIdentifier,
    card_background: cardBackgroundByServiceMap[platformIdentifier] ?? null,
    url: platform.url,
    ordering: -1, // registered platforms are displayed at the first position
    deployment_request_type: (platform.deployment_request?.type ??
      undefined) as DeploymentTypeEnum,
    service_instance_status:
      platform.subscription?.service_instance?.creation_status ?? undefined,
    start_date: platform.subscription?.start_date ?? undefined,
    end_date: platform.subscription?.end_date ?? undefined,
  };
};

export const hasTrialInstance = (
  registrationList: ServiceInstanceCardData[]
): boolean => {
  const activeTrialInstances = registrationList.filter(
    (platform) => platform.deployment_request_type === DeploymentTypeEnum.TRIAL
  );
  return activeTrialInstances.length >= 1;
};

const computeUrl = (
  instance:
    | serviceList_fragment$data
    | seoServiceInstanceFragment$data
    | NonNullable<
        NonNullable<
          userServicesOwned_fragment$data['subscription']
        >['service_instance']
      >,
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

export const publicServiceInstanceToInstanceCardData = (
  instance: serviceList_fragment$data
): ServiceInstanceCardData => {
  return {
    id: instance.id,
    isDisabled:
      instance.creation_status === ServiceInstanceCreationStatusEnum.PENDING,
    name: instance.name,
    description: instance.description!,
    displayLinkArrow: isExternalService(
      instance.service_definition!.identifier as ServiceDefinitionIdentifierEnum
    ),
    illustration_document_id: instance.illustration_document_id as string,
    logoBackgroundImageUrl: buildDocumentUrl(
      instance.id,
      instance.logo_document_id
    ),
    service_definition_identifier: instance.service_definition!
      .identifier as ServiceDefinitionIdentifierEnum,
    url: computeUrl(instance),
    ordering: instance.ordering,
  };
};

export const userServicesOwnedServiceToInstanceCardData = ({
  subscription,
}: userServicesOwned_fragment$data): ServiceInstanceCardData => {
  const instance = subscription!.service_instance!;
  return {
    id: instance.id,
    isDisabled:
      instance.creation_status === ServiceInstanceCreationStatusEnum.PENDING,
    name: instance.name,
    description: instance.description!,
    displayLinkArrow: isExternalService(
      instance.service_definition!.identifier as ServiceDefinitionIdentifierEnum
    ),
    illustration_document_id: instance.illustration_document_id as string,
    logoBackgroundImageUrl: buildDocumentUrl(
      instance.id,
      instance.logo_document_id
    ),
    service_definition_identifier: instance.service_definition!
      .identifier as ServiceDefinitionIdentifierEnum,
    url: computeUrl(instance),
    ordering: instance.ordering,
  };
};

export const seoServiceInstanceToInstanceCardData = (
  instance: seoServiceInstanceFragment$data
): ServiceInstanceCardData => {
  return {
    id: instance.id,
    isDisabled: false,
    name: instance.name,
    slug: instance.slug as string,
    description: instance.description!,
    displayLinkArrow: isExternalService(
      instance.service_definition!.identifier as ServiceDefinitionIdentifierEnum
    ),
    illustration_document_id: instance.illustration_document_id as string,
    logoBackgroundImageUrl: buildDocumentUrl(
      instance.id,
      instance.logo_document_id
    ),
    service_definition_identifier: instance.service_definition!
      .identifier as ServiceDefinitionIdentifierEnum,
    url: computeUrl(instance, true),
    ordering: 0,
  };
};
