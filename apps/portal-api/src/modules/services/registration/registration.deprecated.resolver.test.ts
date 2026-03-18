import { GraphQLResolveInfo } from 'graphql';
import { v4 as uuidv4 } from 'uuid';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  contextBypassUser,
  TEST_ORGANIZATIONS,
} from '../../../../tests/tests.const';
import {
  PlatformContract,
  PlatformIdentifier,
  PlatformInput,
  PlatformRegistrationConnectivityStatus,
} from '../../../__generated__/resolvers-types';
import { BadRequestErrorCode } from '../../../utils/error/error.code';
import { registrationApp } from './registration.app';
import registrationResolver from './registration.resolver';

const PLATFORM_TOKEN = uuidv4();

const contextWithPlatformToken = {
  ...contextBypassUser,
  req: { header: (_name: string) => PLATFORM_TOKEN } as never,
};

const platformInput: PlatformInput = {
  id: uuidv4(),
  url: 'http://example.com',
  title: 'My platform',
  contract: PlatformContract.Ce,
  version: 'X.Y.Z',
};

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

  describe('autoRegisterPlatform', () => {
    let autoRegisterSpy: MockInstance;

    beforeEach(() => {
      autoRegisterSpy = vi
        .spyOn(registrationApp, 'autoRegisterPlatform')
        .mockResolvedValue();
    });

    afterEach(() => {
      autoRegisterSpy.mockRestore();
    });

    it('should throw when neither platform nor input is provided', async () => {
      const call = registrationResolver.Mutation!.autoRegisterPlatform!(
        {},
        {},
        contextWithPlatformToken,
        {} as GraphQLResolveInfo
      );

      await expect(call).rejects.toThrow(
        BadRequestErrorCode.MissingAutoRegisterPlatformArgument
      );
    });

    it('should use the deprecated platform arg when input is not provided', async () => {
      await registrationResolver.Mutation!.autoRegisterPlatform!(
        {},
        { platform: platformInput, input: null },
        contextWithPlatformToken,
        {} as GraphQLResolveInfo
      );

      expect(autoRegisterSpy).toHaveBeenCalledWith(PLATFORM_TOKEN, {
        platform: platformInput,
      });
    });

    it('should prefer input.platform over the deprecated platform arg', async () => {
      const inputPlatform: PlatformInput = { ...platformInput, id: uuidv4() };

      await registrationResolver.Mutation!.autoRegisterPlatform!(
        {},
        {
          platform: platformInput,
          input: { platform: inputPlatform },
        },
        contextWithPlatformToken,
        {} as GraphQLResolveInfo
      );

      expect(autoRegisterSpy).toHaveBeenCalledWith(PLATFORM_TOKEN, {
        platform: inputPlatform,
      });
    });
  });
});
