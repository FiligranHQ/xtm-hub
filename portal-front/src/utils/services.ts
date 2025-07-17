import { ServiceInstanceCardData } from '@/components/service/service-instance-card';
import { SERVICE_CREATION_STATUS } from '@/components/service/service.types';
import { enrollOCTIInstanceListFragment$data } from '@generated/enrollOCTIInstanceListFragment.graphql';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '@generated/userServicesOwned_fragment.graphql';

export const isExternalService = (
  service_definition_identifier: ServiceDefinitionIdentifierEnum
) =>
  [
    ServiceDefinitionIdentifierEnum.LINK,
    ServiceDefinitionIdentifierEnum.OCTI_ENROLLMENT,
  ].includes(service_definition_identifier);

export const isEnrollmentService = (serviceInstance: ServiceInstanceCardData) =>
  [ServiceDefinitionIdentifierEnum.OCTI_ENROLLMENT].includes(
    serviceInstance.service_definition_identifier as ServiceDefinitionIdentifierEnum
  );

export const octiInstanceToServiceInstanceCardData = (
  instance: enrollOCTIInstanceListFragment$data['octiInstances'][number]
): ServiceInstanceCardData => {
  return {
    id: instance.id,
    platform_id: instance.platform_id,
    creation_status: SERVICE_CREATION_STATUS.CREATED,
    name: instance.title,
    platform_contract: instance.contract,
    illustration_document_id: null,
    logo_document_id: null,
    service_definition_identifier:
      ServiceDefinitionIdentifierEnum.OCTI_ENROLLMENT,
    url: instance.url,
    ordering: -1, // OCTI Instances are displayed at the first position
  };
};

export const publicServiceInstanceToInstanceCardData = (
  instance: serviceList_fragment$data
): ServiceInstanceCardData => {
  return {
    id: instance.id,
    creation_status: instance.creation_status as SERVICE_CREATION_STATUS,
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
    creation_status: instance.creation_status as SERVICE_CREATION_STATUS,
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
    creation_status: SERVICE_CREATION_STATUS.CREATED,
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
