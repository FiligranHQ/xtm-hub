import { settingsContext_fragment$data } from '@generated/settingsContext_fragment.graphql';

export const isOCTIEnrollmentEnabled = (
  settings?: settingsContext_fragment$data | null
) => settings && isFeatureEnabled(settings, 'OCTI_ENROLLMENT');

export const isFeatureEnabled = (
  settings: settingsContext_fragment$data,
  id: string
) => {
  const flags = settings.platform_feature_flags ?? [];
  // config can target all FF available with special FF id "*"
  if (flags.find((f) => f.id === '*' && f.enabled)) {
    return true;
  }
  return flags.some((flag) => flag.id === id && flag.enabled);
};
