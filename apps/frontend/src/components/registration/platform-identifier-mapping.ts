import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import { ServiceDefinitionIdentifier as ServiceDefinitionIdentifierFragment } from '@generated/serviceInstance_fragment.graphql';
import {
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
export interface PlatformMetadata {
  name: string;
  learnMorePublicUrl: string;
  learnMorePrivateUrl: string;
  logoUrl: string;
}

export const PlatformMetadataMapping: Record<
  PlatformIdentifierEnum,
  PlatformMetadata
> = {
  [PlatformIdentifierEnum.OPENCTI]: {
    name: 'OpenCTI',
    learnMorePublicUrl: '/cybersecurity-solutions/opencti-free-trial',
    learnMorePrivateUrl: '/app/service/opencti-free-trial',
    logoUrl: '/logo_opencti_dark.png',
  },
  [PlatformIdentifierEnum.OPENAEV]: {
    name: 'OpenAEV',
    learnMorePublicUrl: '/cybersecurity-solutions/openaev-free-trial',
    learnMorePrivateUrl: '/app/service/openaev-free-trial',
    logoUrl: '/logo_openaev_dark.png',
  },
};

export const translateServiceDefinitionIdentifier = (
  serviceDefinitionIdentifier: ServiceDefinitionIdentifierFragment
): string => {
  const platformIdentifierEnum =
    ServiceDefinitionIdentifierToPlatformIdentifier[
      serviceDefinitionIdentifier
    ] ?? PlatformIdentifierEnum.OPENAEV;

  return PlatformMetadataMapping[platformIdentifierEnum].name;
};

export const ServiceDefinitionIdentifierToPlatformIdentifier: Partial<
  Record<ServiceDefinitionIdentifierFragment, PlatformIdentifierEnum>
> = {
  [ServiceDefinitionIdentifier.OpenctiRegistration]:
    PlatformIdentifierEnum.OPENCTI,
  [ServiceDefinitionIdentifier.OpenaevRegistration]:
    PlatformIdentifierEnum.OPENAEV,
};

export const serviceInstanceTagByPlatformIdentifier: Record<
  PlatformIdentifierEnum,
  ServiceInstanceTagEnum
> = {
  [PlatformIdentifierEnum.OPENCTI]: ServiceInstanceTagEnum.OPENCTI,
  [PlatformIdentifierEnum.OPENAEV]: ServiceInstanceTagEnum.OPENAEV,
};

export const getRegisteredPlatformServiceIdentifier = (
  platformIdentifier: PlatformIdentifier
): ServiceDefinitionIdentifier | undefined => {
  const mapping: Record<PlatformIdentifier, ServiceDefinitionIdentifier> = {
    [PlatformIdentifier.Opencti]:
      ServiceDefinitionIdentifier.OpenctiRegistration,
    [PlatformIdentifier.Openaev]:
      ServiceDefinitionIdentifier.OpenaevRegistration,
  };

  return mapping[platformIdentifier];
};
