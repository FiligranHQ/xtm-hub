import { isFeatureEnabled } from '@/utils/isFeatureEnabled';
import { settingsContext_fragment$data } from '@generated/settingsContext_fragment.graphql';

describe('isFeatureEnabled', () => {
  it('should return true when settings contain wildcard', () => {
    const settings: Partial<settingsContext_fragment$data> = {
      platform_feature_flags: ['*'],
    };
    const result = isFeatureEnabled(
      settings as settingsContext_fragment$data,
      'octi_enrollment'
    );

    expect(result).toBeTruthy();
  });

  it('should return true when settings contain the required feature flag', () => {
    const settings: Partial<settingsContext_fragment$data> = {
      platform_feature_flags: ['octi_enrollment'],
    };
    const result = isFeatureEnabled(
      settings as settingsContext_fragment$data,
      'octi_enrollment'
    );

    expect(result).toBeTruthy();
  });

  it('should return false when settings does not contain the required feature nor the wildcard', () => {
    const settings: Partial<settingsContext_fragment$data> = {
      platform_feature_flags: [],
    };
    const result = isFeatureEnabled(
      settings as settingsContext_fragment$data,
      'octi_enrollment'
    );

    expect(result).toBeFalsy();
  });
});
