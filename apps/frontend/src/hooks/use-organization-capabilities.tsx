import { OrganizationCapability } from '@graphql/generated';

export const useOrganizationCapabilities = () => {
  return Object.values(OrganizationCapability);
};
