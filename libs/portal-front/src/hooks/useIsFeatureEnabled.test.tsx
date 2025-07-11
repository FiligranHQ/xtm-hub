import {
  Settings,
  SettingsContext,
  SettingsProps,
} from '@/components/settings/env-portal-context';
import { useIsFeatureEnabled } from '@/hooks/useIsFeatureEnabled';
import { FeatureFlag } from '@/utils/constant';
import { settingsContext_fragment$data } from '@generated/settingsContext_fragment.graphql';
import { renderHook } from '@testing-library/react';
import { expect } from 'vitest';

describe('useIsFeatureEnabled', () => {
  const createWrapper = (contextValue: Settings) => {
    // eslint-disable-next-line react/display-name
    return ({ children }: SettingsProps) => (
      <SettingsContext.Provider value={contextValue}>
        {children}
      </SettingsContext.Provider>
    );
  };

  it.each`
    expected | featureFlags
    ${true}  | ${['*']}
    ${true}  | ${[FeatureFlag.DUMMY]}
    ${false} | ${[]}
  `(
    'Should return $expected when enabled feature flags are $featureFlags',
    ({ expected, featureFlags }) => {
      const settings: settingsContext_fragment$data = {
        platform_feature_flags: featureFlags,
      } as Partial<settingsContext_fragment$data> as settingsContext_fragment$data;

      const { result } = renderHook(
        () => useIsFeatureEnabled(FeatureFlag.DUMMY),
        { wrapper: createWrapper({ settings }) }
      );

      expect(result.current).toBe(expected);
    }
  );
});
