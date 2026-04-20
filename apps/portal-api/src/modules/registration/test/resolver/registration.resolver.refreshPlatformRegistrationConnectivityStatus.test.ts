import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
} from '../../../../../tests/tests.const';
import {
  PlatformIdentifier,
  PlatformRegistrationConnectivityStatus,
  RefreshPlatformRegistrationConnectivityStatusInput,
} from '../../../../__generated__/resolvers-types';
import { registrationApp } from '../../registration.app';
import registrationResolver from '../../registration.resolver';

describe('mutation.refreshPlatformRegistrationConnectivityStatus', () => {
  it.each`
    status                                             | description
    ${PlatformRegistrationConnectivityStatus.Active}   | ${'active'}
    ${PlatformRegistrationConnectivityStatus.Inactive} | ${'inactive'}
    ${PlatformRegistrationConnectivityStatus.NotFound} | ${'not_found'}
  `(
    'should delegate to registrationApp and return status $description without transformation',
    async ({ status }: { status: PlatformRegistrationConnectivityStatus }) => {
      // Given
      const input: RefreshPlatformRegistrationConnectivityStatusInput = {
        platformId: uuidv4(),
        token: uuidv4(),
        platformVersion: '6.0.0',
        platformIdentifier: PlatformIdentifier.Opencti,
      };
      vi.spyOn(
        registrationApp,
        'refreshPlatformRegistrationConnectivityStatus'
      ).mockResolvedValue({ status });

      // When
      const result = await registrationResolver.Mutation!
        .refreshPlatformRegistrationConnectivityStatus!(
        {},
        { input },
        contextSimpleUserFiligran2,
        GRAPHQL_RESOLVE_INFO
      );

      // Then
      expect(
        registrationApp.refreshPlatformRegistrationConnectivityStatus
      ).toHaveBeenCalledWith(input);
      expect(result).toMatchObject({ status });
    }
  );
});
