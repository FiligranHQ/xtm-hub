import { isFeatureEnabled } from '@/utils/isFeatureEnabled';
import { settingsContext_fragment$data } from '@generated/settingsContext_fragment.graphql';

describe('isFeatureEnabled', () => {
  it('should return true when settings contain an enabled *', () => {
    const settings: Partial<settingsContext_fragment$data> = {
      platform_feature_flags: [{ id: '*', enabled: true }],
    };
    const result = isFeatureEnabled(
      settings as settingsContext_fragment$data,
      'octi_enrollment'
    );

    expect(result).toBeTruthy();
  });

  it('should return false when settings contain a disabled *', () => {
    const settings: Partial<settingsContext_fragment$data> = {
      platform_feature_flags: [{ id: '*', enabled: false }],
    };
    const result = isFeatureEnabled(
      settings as settingsContext_fragment$data,
      'octi_enrollment'
    );

    expect(result).toBeFalsy();
  });

  it('should return true when settings contain the enabled required feature', () => {
    const settings: Partial<settingsContext_fragment$data> = {
      platform_feature_flags: [{ id: 'octi_enrollment', enabled: true }],
    };
    const result = isFeatureEnabled(
      settings as settingsContext_fragment$data,
      'octi_enrollment'
    );

    expect(result).toBeTruthy();
  });

  it('should return false when settings contain the disabled required feature', () => {
    const settings: Partial<settingsContext_fragment$data> = {
      platform_feature_flags: [{ id: 'octi_enrollment', enabled: false }],
    };
    const result = isFeatureEnabled(
      settings as settingsContext_fragment$data,
      'octi_enrollment'
    );

    expect(result).toBeFalsy();
  });

  it('should return false when settings does not contain the required feature', () => {
    const settings: Partial<settingsContext_fragment$data> = {
      platform_feature_flags: [{ id: 'another_feature', enabled: true }],
    };
    const result = isFeatureEnabled(
      settings as settingsContext_fragment$data,
      'octi_enrollment'
    );

    expect(result).toBeFalsy();
  });
});
