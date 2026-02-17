import { useFreeTrial } from '@/components/service/trial-instances/useFreeTrials';
import { testRenderHook } from '@/utils/test/test-render';
import { act } from '@testing-library/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { describe, expect, it } from 'vitest';

describe('useFreeTrial', () => {
  it('should return null with empty registred platforms', async () => {
    const environment = createMockEnvironment();
    const { result } = testRenderHook(() => useFreeTrial(), {
      relayConfig: environment,
    });
    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              registeredPlatforms: [], // Empty array = no trials
            };
          },
        })
      );
    });
    expect(result.current).toBeDefined();
    expect(result.current).toEqual({ freeTrial: null, isBlacklisted: '' });
  });

  it('should return trial registred platforms', async () => {
    const environment = createMockEnvironment();
    const { result } = testRenderHook(() => useFreeTrial(), {
      relayConfig: environment,
    });
    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              registeredPlatforms: [
                {
                  deployment_request: {
                    type: 'trial',
                    counts_in_orga_quota: true,
                  },
                },
              ],
            };
          },
        })
      );
    });
    expect(result.current).toBeDefined();
    expect(result.current.freeTrial).toBeDefined();
    expect(
      result.current.freeTrial.deployment_request.counts_in_orga_quota
    ).toBeTruthy();
    expect(result.current.freeTrial.deployment_request.type).toEqual('trial');
  });

  it('should not return a trial instance', async () => {
    const environment = createMockEnvironment();
    const { result } = testRenderHook(() => useFreeTrial(), {
      relayConfig: environment,
    });
    await act(async () => {
      environment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              registeredPlatforms: [
                {
                  deployment_request: {
                    type: 'Not a trial',
                    counts_in_orga_quota: false,
                  },
                },
              ],
            };
          },
        })
      );
    });
    expect(result.current).toBeDefined();
    expect(result.current.freeTrial).toBeNull();
  });
});
