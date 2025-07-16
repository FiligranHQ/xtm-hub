import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';

export const isExternalService = (serviceInstance: serviceList_fragment$data) =>
  [
    ServiceDefinitionIdentifierEnum.LINK,
    ServiceDefinitionIdentifierEnum.OCTI_ENROLLMENT,
  ].includes(
    serviceInstance?.service_definition
      ?.identifier as ServiceDefinitionIdentifierEnum
  );

export const isEnrollmentService = (
  serviceInstance: serviceList_fragment$data
) =>
  [ServiceDefinitionIdentifierEnum.OCTI_ENROLLMENT].includes(
    serviceInstance?.service_definition
      ?.identifier as ServiceDefinitionIdentifierEnum
  );
