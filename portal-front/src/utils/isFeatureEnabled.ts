import { settingsContext_fragment$data } from '@generated/settingsContext_fragment.graphql';

export const isOCTIEnrollmentEnabled = (
  settings?: settingsContext_fragment$data | null
) => settings && isFeatureEnabled(settings, 'OCTI_ENROLLMENT');

export const isFeatureEnabled = (
  settings: settingsContext_fragment$data,
  requiredFlag: string
) => {
  return (settings.platform_feature_flags ?? []).some((flag) =>
    ['*', requiredFlag].includes(flag)
  );
};
