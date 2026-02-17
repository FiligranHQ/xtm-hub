import { GraphQLResolveInfo } from 'graphql';
import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import {
  contextBypassUser,
  TEST_ORGANIZATIONS,
} from '../../../../tests/tests.const';
import {
  PlatformContract,
  PlatformIdentifier,
  PlatformRegistrationConnectivityStatus,
} from '../../../__generated__/resolvers-types';
import { registrationApp } from './registration.app';
import registrationResolver from './registration.resolver';

describe('Registration query resolver', () => {
  describe('openCTIPlatformRegistrationStatus', () => {
    it('should return inactive when platform is not registered', async () => {
      expect(
        registrationResolver.Query?.openCTIPlatformRegistrationStatus
      ).toBeDefined();
      if (!registrationResolver.Query?.openCTIPlatformRegistrationStatus) {
        return;
      }
      const result =
        await registrationResolver.Query.openCTIPlatformRegistrationStatus(
          {},
          { input: { platformId: uuidv4(), token: uuidv4() } },
          contextBypassUser,
          {} as GraphQLResolveInfo
        );

      expect(result?.status).toBe(
        PlatformRegistrationConnectivityStatus.Inactive
      );
    });
    it('should return active when platform is registered', async () => {
      expect(
        registrationResolver.Query?.openCTIPlatformRegistrationStatus
      ).toBeDefined();
      if (!registrationResolver.Query?.openCTIPlatformRegistrationStatus) {
        return;
      }

      const platformId = uuidv4();
      const token = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.FILIGRAN.ID,
        platform: {
          id: platformId,
          url: 'http://example.com',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: 'X.Y.Z',
        },
        identifier: PlatformIdentifier.Opencti,
      });

      const result =
        await registrationResolver.Query.openCTIPlatformRegistrationStatus(
          {},
          { input: { platformId, token } },
          contextBypassUser,
          {} as GraphQLResolveInfo
        );

      expect(result.status).toBe(PlatformRegistrationConnectivityStatus.Active);
    });
  });
});
