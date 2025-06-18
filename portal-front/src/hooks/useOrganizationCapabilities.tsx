import { SettingsContext } from '@/components/settings/env-portal-context';
import { isOCTIEnrollmentEnabled } from '@/utils/isFeatureEnabled';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { useContext } from 'react';

export const useOrganizationCapabilities = () => {
  const { settings } = useContext(SettingsContext);

  return Object.values(OrganizationCapabilityEnum).filter((value) => {
    const isCapabilityFeatureFlagged =
      value === OrganizationCapabilityEnum.MANAGE_OCTI_ENROLLMENT;
    if (!isCapabilityFeatureFlagged) {
      return true;
    }

    return isOCTIEnrollmentEnabled(settings);
  });
};
