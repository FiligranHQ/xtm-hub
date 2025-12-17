import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceDefinitionIdentifier } from '@generated/serviceInstance_fragment.graphql';

export const PlatformTranslationMapping: Record<
  PlatformIdentifierEnum,
  string
> = {
  [PlatformIdentifierEnum.OPENCTI]: 'OpenCTI',
  [PlatformIdentifierEnum.OPENAEV]: 'OpenAEV',
};

export const translateServiceDefinitionIdentifier = (
  serviceDefinitionIdentifier: ServiceDefinitionIdentifier
): string => {
  const platformIdentifierEnum =
    serviceDefinitionIdentifier ===
    ServiceDefinitionIdentifierEnum.OPENCTI_REGISTRATION
      ? PlatformIdentifierEnum.OPENCTI
      : PlatformIdentifierEnum.OPENAEV;

  return PlatformTranslationMapping[platformIdentifierEnum];
};
