import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';

export const useOrganizationCapabilities = () => {
  return Object.values(OrganizationCapabilityEnum);
};
