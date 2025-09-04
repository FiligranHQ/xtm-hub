import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';

export const useOrganizationCapabilities = () => {
  const isOpenAEVRegistrationEnabled = useIsFeatureEnabled(
    FeatureFlag.OPENAEV_REGISTRATION
  );

  return Object.values(OrganizationCapabilityEnum).filter(
    (capability) =>
      capability !== OrganizationCapabilityEnum.MANAGE_OPENAEV_REGISTRATION ||
      isOpenAEVRegistrationEnabled
  );
};
