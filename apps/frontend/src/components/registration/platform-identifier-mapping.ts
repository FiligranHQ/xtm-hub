import { ServiceDefinitionIdentifier as ServiceDefinitionIdentifierFragment } from '@generated/serviceInstance_fragment.graphql';
import {
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
  ServiceInstanceTag,
} from '@graphql/generated';
export interface PlatformMetadata {
  name: string;
  learnMorePublicUrl: string;
  learnMorePrivateUrl: string;
  logoUrl: string;
  docUrl: string;
}

export const PlatformMetadataMapping: Record<
  PlatformIdentifier,
  PlatformMetadata
> = {
  [PlatformIdentifier.Opencti]: {
    name: 'OpenCTI',
    learnMorePublicUrl: '/cybersecurity-solutions/opencti-free-trial',
    learnMorePrivateUrl: '/app/service/opencti-free-trial',
    logoUrl: '/logo_opencti_dark.png',
    docUrl: 'https://docs.opencti.io/latest/administration/hub/',
  },
  [PlatformIdentifier.Openaev]: {
    name: 'OpenAEV',
    learnMorePublicUrl: '/cybersecurity-solutions/openaev-free-trial',
    learnMorePrivateUrl: '/app/service/openaev-free-trial',
    logoUrl: '/logo_openaev_dark.png',
    docUrl: 'https://docs.openaev.io/latest/administration/hub/',
  },
};

export const translateServiceDefinitionIdentifier = (
  serviceDefinitionIdentifier: ServiceDefinitionIdentifierFragment
): string => {
  const platformIdentifier =
    ServiceDefinitionIdentifierToPlatformIdentifier[
      serviceDefinitionIdentifier
    ] ?? PlatformIdentifier.Openaev;

  return PlatformMetadataMapping[platformIdentifier].name;
};

export const ServiceDefinitionIdentifierToPlatformIdentifier: Partial<
  Record<ServiceDefinitionIdentifierFragment, PlatformIdentifier>
> = {
  [ServiceDefinitionIdentifier.OpenctiRegistration]: PlatformIdentifier.Opencti,
  [ServiceDefinitionIdentifier.OpenaevRegistration]: PlatformIdentifier.Openaev,
};

export const serviceInstanceTagByPlatformIdentifier: Record<
  PlatformIdentifier,
  ServiceInstanceTag
> = {
  [PlatformIdentifier.Opencti]: ServiceInstanceTag.OpenCti,
  [PlatformIdentifier.Openaev]: ServiceInstanceTag.OpenAev,
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
