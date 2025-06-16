import { isOCTIEnrollmentEnabled } from '@/utils/isFeatureEnabled';
import { settingsContext_fragment$data } from '@generated/settingsContext_fragment.graphql';

export enum RESTRICTION {
  CAPABILITY_BYPASS = 'BYPASS',
}

export enum OrganizationCapabilityName {
  ADMINISTRATE_ORGANIZATION = 'ADMINISTRATE_ORGANIZATION',
  MANAGE_ACCESS = 'MANAGE_ACCESS',
  MANAGE_SUBSCRIPTION = 'MANAGE_SUBSCRIPTION',
  MANAGE_OCTI_ENROLLMENT = 'MANAGE_OCTI_ENROLLMENT',
}

export const buildOrganizationCapabilitiesMultiSelectOptions = (
  settings?: settingsContext_fragment$data | null
) =>
  Object.values(OrganizationCapabilityName)
    .filter(
      (value) =>
        value !== OrganizationCapabilityName.MANAGE_OCTI_ENROLLMENT ||
        isOCTIEnrollmentEnabled(settings)
    )
    .map((value) => ({
      label: value.replaceAll('_', ' '),
      value,
    }));

export const DEBOUNCE_TIME = 300;
export const ANIMATION_TIME = 300;
