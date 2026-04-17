import config from 'config';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
} from '../../../tests/tests.const';
import { FeatureFlag } from '../../__generated__/resolvers-types';
import settingsResolver from './settings.resolver';

vi.mock('config', () => ({
  default: { get: vi.fn() },
}));

vi.mock('../../config', () => ({
  default: { enabled_features: [FeatureFlag.Dummy] },
}));

describe('query.settings', () => {
  it('should return settings built from config and portalConfig', () => {
    // Given
    const mockLoginSettings = [{ provider: 'local' }];
    const mockBaseUrl = 'http://localhost:3002';
    const mockEnvironment = 'test';
    vi.mocked(config.get)
      .mockReturnValueOnce(mockLoginSettings)
      .mockReturnValueOnce(mockBaseUrl)
      .mockReturnValueOnce(mockEnvironment);

    // When
    const result = settingsResolver.Query!.settings!(
      {},
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(result).toMatchObject({
      platform_providers: mockLoginSettings,
      base_url_front: mockBaseUrl,
      environment: mockEnvironment,
      platform_feature_flags: [FeatureFlag.Dummy],
    });
  });

  it('should call config.get with the expected keys', () => {
    // Given
    vi.mocked(config.get).mockReturnValue('mocked');

    // When
    settingsResolver.Query!.settings!(
      {},
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(config.get).toHaveBeenCalledWith('login_settings');
    expect(config.get).toHaveBeenCalledWith('base_url_front');
    expect(config.get).toHaveBeenCalledWith('environment');
  });
});
