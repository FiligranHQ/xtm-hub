import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';

export const RegistrationTranslationMapping: Record<
  PlatformIdentifierEnum,
  string
> = {
  [PlatformIdentifierEnum.OPENCTI]: 'OpenCTI',
};

export const RegistrationCapabilityMapping: Record<
  PlatformIdentifierEnum,
  OrganizationCapabilityEnum
> = {
  [PlatformIdentifierEnum.OPENCTI]:
    OrganizationCapabilityEnum.MANAGE_OPENCTI_REGISTRATION,
};
