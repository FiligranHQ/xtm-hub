import { isOCTIEnrollmentEnabled } from '@/utils/isFeatureEnabled';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { settingsContext_fragment$data } from '@generated/settingsContext_fragment.graphql';

export enum RESTRICTION {
  CAPABILITY_BYPASS = 'BYPASS',
}

export const buildOrganizationCapabilitiesMultiSelectOptions = (
  settings?: settingsContext_fragment$data | null
) =>
  Object.values(OrganizationCapabilityEnum)
    .filter(
      (value) =>
        value !== OrganizationCapabilityEnum.MANAGE_OCTI_ENROLLMENT ||
        isOCTIEnrollmentEnabled(settings)
    )
    .map((value) => ({
      label: value.replaceAll('_', ' '),
      value,
    }));

export const DEBOUNCE_TIME = 300;
export const ANIMATION_TIME = 300;
