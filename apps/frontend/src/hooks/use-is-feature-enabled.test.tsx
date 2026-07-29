import {
  Settings,
  SettingsContext,
  SettingsProps,
} from '@/components/settings/EnvPortalContext';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { settingsContext_fragment$data } from '@generated/settingsContext_fragment.graphql';
import { FeatureFlag } from '@graphql/generated';
import { renderHook } from '@testing-library/react';
import { expect } from 'vitest';

vi.unmock('@/hooks/use-is-feature-enabled');

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
    ${true}  | ${[FeatureFlag.Dummy]}
    ${false} | ${[]}
  `(
    'Should return $expected when enabled feature flags are $featureFlags',
    ({ expected, featureFlags }) => {
      const settings: settingsContext_fragment$data = {
        platform_feature_flags: featureFlags,
      } as Partial<settingsContext_fragment$data> as settingsContext_fragment$data;

      const { result } = renderHook(
        () => useIsFeatureEnabled(FeatureFlag.Dummy),
        { wrapper: createWrapper({ settings }) }
      );

      expect(result.current).toBe(expected);
    }
  );
});
