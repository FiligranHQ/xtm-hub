import {
  LogoXtmOneIcon,
  OpenAevIconIcon,
  OpenCtiIconIcon,
} from '@filigran/icon';
import { ServiceDefinitionIdentifier as ServiceDefinitionIdentifierFragment } from '@generated/serviceInstance_fragment.graphql';
import {
  PlatformContract,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
  ServiceInstanceTag,
} from '@graphql/generated';
import openaevTextLogo from '@public/logo_openaev_text.png';
import openctiTextLogo from '@public/logo_opencti_text.png';
import xtmoneTextLogo from '@public/logo_xtmone_text.png';
import { StaticImageData } from 'next/image';
import { JSX } from 'react';

export interface PlatformMetadata {
  name: string;
  learnMorePublicUrl: string;
  learnMorePrivateUrl: string;
  logoUrl: string;
  textLogo: StaticImageData;
  docUrl: string;
  Icon: ({ className }: { className: string }) => JSX.Element;
  iconClassName: string;
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
    textLogo: openctiTextLogo,
    docUrl: 'https://docs.opencti.io/latest/administration/hub/',
    Icon: ({ className }) => <OpenCtiIconIcon className={className} />,
    iconClassName: 'text-filigran-brand-primary',
  },
  [PlatformIdentifier.Openaev]: {
    name: 'OpenAEV',
    learnMorePublicUrl: '/cybersecurity-solutions/openaev-free-trial',
    learnMorePrivateUrl: '/app/service/openaev-free-trial',
    logoUrl: '/logo_openaev_dark.png',
    textLogo: openaevTextLogo,
    docUrl: 'https://docs.openaev.io/latest/administration/hub/',
    Icon: ({ className }) => <OpenAevIconIcon className={className} />,
    iconClassName: 'text-filigran-brand-primary',
  },
  [PlatformIdentifier.Xtmone]: {
    name: 'XTM One',
    learnMorePublicUrl: '',
    learnMorePrivateUrl: '',
    logoUrl: '/logo_xtmone_dark.png',
    textLogo: xtmoneTextLogo,
    docUrl: '',
    Icon: ({ className }) => <LogoXtmOneIcon className={className} />,
    iconClassName: 'text-filigran-ia-main',
  },
};

export const CONTRACT_LABEL_BY_CONTRACT: Record<PlatformContract, string> = {
  [PlatformContract.Ce]: 'Contracts.CE',
  [PlatformContract.Ee]: 'Contracts.EE',
  [PlatformContract.Trial]: 'Contracts.TRIAL',
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
  [PlatformIdentifier.Xtmone]: ServiceInstanceTag.XtmOne,
};

export const getRegisteredPlatformServiceIdentifier = (
  platformIdentifier: PlatformIdentifier
): ServiceDefinitionIdentifier => {
  const mapping: Record<PlatformIdentifier, ServiceDefinitionIdentifier> = {
    [PlatformIdentifier.Opencti]:
      ServiceDefinitionIdentifier.OpenctiRegistration,
    [PlatformIdentifier.Openaev]:
      ServiceDefinitionIdentifier.OpenaevRegistration,
    [PlatformIdentifier.Xtmone]: ServiceDefinitionIdentifier.XtmoneRegistration,
  };

  return mapping[platformIdentifier];
};
