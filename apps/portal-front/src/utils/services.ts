import { ServiceInstanceCardData } from '@/components/service/service-instance-card';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceInstanceCreationStatusEnum } from '@generated/models/ServiceInstanceCreationStatus.enum';
import { registerRegisteredPlatformListFragment$data } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '@generated/userServicesOwned_fragment.graphql';

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

export const registeredPlatformToServiceInstanceCardData = (
  platform: registerRegisteredPlatformListFragment$data['registeredPlatforms'][number]
): ServiceInstanceCardData => {
  const card_background_by_service_map: Partial<
    Record<ServiceDefinitionIdentifierEnum, string>
  > = {
    [ServiceDefinitionIdentifierEnum.OPENCTI_REGISTRATION]:
      'bg-gradient-to-br from-[#05105A] via-[#095298] to-[#05105A]',
    [ServiceDefinitionIdentifierEnum.OPENAEV_REGISTRATION]:
      'bg-gradient-to-br from-[#0F1E38] via-[#0A6D6A] to-[#0F1E38]',
  };
  const platform_identifier =
    platform.identifier as ServiceDefinitionIdentifierEnum;
  return {
    id: platform.id,
    platform_id: platform.platform_id,
    creation_status: ServiceInstanceCreationStatusEnum.CREATED,
    name: platform.title,
    platform_contract: platform.contract,
    illustration_document_id: null,
    logo_document_id: null,
    service_definition_identifier: platform_identifier,
    card_background:
      card_background_by_service_map[platform_identifier] ?? null,
    url: platform.url,
    ordering: -1, // registered platforms are displayed at the first position
  };
};

export const publicServiceInstanceToInstanceCardData = (
  instance: serviceList_fragment$data
): ServiceInstanceCardData => {
  return {
    id: instance.id,
    creation_status:
      instance.creation_status as ServiceInstanceCreationStatusEnum,
    name: instance.name,
    description: instance.description!,
    illustration_document_id: instance.illustration_document_id as string,
    logo_document_id: instance.logo_document_id as string,
    service_definition_identifier: instance.service_definition!
      .identifier as ServiceDefinitionIdentifierEnum,
    url: instance.links?.[0]?.url as string,
    ordering: instance.ordering,
  };
};

export const userServicesOwnedServiceToInstanceCardData = ({
  subscription,
}: userServicesOwned_fragment$data): ServiceInstanceCardData => {
  const instance = subscription!.service_instance!;
  return {
    id: instance.id,
    creation_status:
      instance.creation_status as ServiceInstanceCreationStatusEnum,
    name: instance.name,
    description: instance.description!,
    illustration_document_id: instance.illustration_document_id as string,
    logo_document_id: instance.logo_document_id as string,
    service_definition_identifier: instance.service_definition!
      .identifier as ServiceDefinitionIdentifierEnum,
    url: instance.links?.[0]?.url as string,
    ordering: instance.ordering,
  };
};

export const seoServiceInstanceToInstanceCardData = (
  instance: seoServiceInstanceFragment$data
): ServiceInstanceCardData => {
  return {
    id: instance.id,
    creation_status: ServiceInstanceCreationStatusEnum.CREATED,
    name: instance.name,
    slug: instance.slug as string,
    description: instance.description!,
    illustration_document_id: instance.illustration_document_id as string,
    logo_document_id: instance.logo_document_id as string,
    service_definition_identifier: instance.service_definition!
      .identifier as ServiceDefinitionIdentifierEnum,
    url: instance.links?.[0]?.url as string,
    ordering: 0,
  };
};
