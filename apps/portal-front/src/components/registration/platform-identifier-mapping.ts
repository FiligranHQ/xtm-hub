import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';

export const PlatformTranslationMapping: Record<
  PlatformIdentifierEnum,
  string
> = {
  [PlatformIdentifierEnum.OPENCTI]: 'OpenCTI',
  [PlatformIdentifierEnum.OPENAEV]: 'OpenAEV',
};

export const RegistrationCapabilityMapping: Record<
  PlatformIdentifierEnum,
  OrganizationCapabilityEnum
> = {
  [PlatformIdentifierEnum.OPENCTI]:
    OrganizationCapabilityEnum.MANAGE_OPENCTI_REGISTRATION,
  [PlatformIdentifierEnum.OPENAEV]:
    OrganizationCapabilityEnum.MANAGE_OPENAEV_REGISTRATION,
};
