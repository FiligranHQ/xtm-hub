import { OpenAevIconIcon, OpenCtiIconIcon } from '@filigran/icon';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import { ServiceDefinitionIdentifier as ServiceDefinitionIdentifierFragment } from '@generated/serviceInstance_fragment.graphql';
import {
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '@graphql/generated';
import { JSX } from 'react';

export interface PlatformMetadata {
  name: string;
  learnMorePublicUrl: string;
  learnMorePrivateUrl: string;
  logoUrl: string;
  docUrl: string;
  Icon: ({ className }: { className: string }) => JSX.Element;
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
    docUrl: 'https://docs.opencti.io/latest/administration/hub/',
    Icon: ({ className }) => <OpenCtiIconIcon className={className} />,
  },
  [PlatformIdentifierEnum.OPENAEV]: {
    name: 'OpenAEV',
    learnMorePublicUrl: '/cybersecurity-solutions/openaev-free-trial',
    learnMorePrivateUrl: '/app/service/openaev-free-trial',
    logoUrl: '/logo_openaev_dark.png',
    docUrl: 'https://docs.openaev.io/latest/administration/hub/',
    Icon: ({ className }) => <OpenAevIconIcon className={className} />,
  },
};

export const CONTRACT_LABEL_BY_CONTRACT: Record<PlatformContractEnum, string> =
  {
    [PlatformContractEnum.CE]: 'Contracts.CE',
    [PlatformContractEnum.EE]: 'Contracts.EE',
    [PlatformContractEnum.TRIAL]: 'Contracts.TRIAL',
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
  Record<ServiceDefinitionIdentifierFragment, PlatformIdentifier>
> = {
  [ServiceDefinitionIdentifier.OpenctiRegistration]: PlatformIdentifier.Opencti,
  [ServiceDefinitionIdentifier.OpenaevRegistration]: PlatformIdentifier.Openaev,
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
