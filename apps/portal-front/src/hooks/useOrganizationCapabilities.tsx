import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';

export const useOrganizationCapabilities = () => {
  const isOCTIEnrollmentFeatureEnabled = useIsFeatureEnabled(
    FeatureFlag.OCTI_ENROLLMENT
  );

  return Object.values(OrganizationCapabilityEnum).filter((value) => {
    const isCapabilityFeatureFlagged =
      value === OrganizationCapabilityEnum.MANAGE_OCTI_ENROLLMENT;

    return !isCapabilityFeatureFlagged || isOCTIEnrollmentFeatureEnabled;
  });
};
