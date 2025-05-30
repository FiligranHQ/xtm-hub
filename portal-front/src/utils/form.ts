import { OrganizationCapabilityName } from '@/utils/constant';

export const buildOrganizationCapabilitiesMultiSelectOptions = () => {
  return Object.values(OrganizationCapabilityName).map((capability) => ({
    label: capability,
    value: capability,
  }));
};
