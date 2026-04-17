import { describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  DeploymentRequestPlatformRegion,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import { ErrorCode } from '../../../utils/error/error.code';
import { DeploymentQuotaDomain } from './deployment.quota.domain';

describe('deploymentQuotaDomain', () => {
  const platformIdentifier = PlatformIdentifier.Opencti;
  const region = DeploymentRequestPlatformRegion.UsEast;

  describe('reservePlace', () => {
    it('should throw when quota is not found', async () => {
      const call = DeploymentQuotaDomain.reservePlace(
        'test' as PlatformIdentifier,
        DeploymentRequestPlatformRegion.EuWest
      );

      await expect(call).rejects.toThrow(
        ErrorCode.DeploymentRequestQuotaNotFound
      );
    });

    it('should return that place is not available when availability is equal to 0', async () => {
      await TestHelper.deploymentRequestQuota.update(
        {
          region,
          platform_identifier: platformIdentifier,
        },
        { availability: 0 }
      );

      const result = await DeploymentQuotaDomain.reservePlace(
        platformIdentifier,
        region
      );

      expect(result.isPlaceAvailable).toBe(false);
    });

    it('should return that place is not available when availability is lower than 0', async () => {
      await TestHelper.deploymentRequestQuota.update(
        {
          region,
          platform_identifier: platformIdentifier,
        },
        { availability: -1 }
      );

      const result = await DeploymentQuotaDomain.reservePlace(
        platformIdentifier,
        region
      );

      expect(result.isPlaceAvailable).toBe(false);
    });
    it('should return that place is available when availability is greater than 0', async () => {
      await TestHelper.deploymentRequestQuota.update(
        {
          region,
          platform_identifier: platformIdentifier,
        },
        { availability: 1 }
      );

      const result = await DeploymentQuotaDomain.reservePlace(
        platformIdentifier,
        region
      );

      expect(result.isPlaceAvailable).toBe(true);
    });
    it('should reserve a place when availability is greater than 0', async () => {
      await TestHelper.deploymentRequestQuota.update(
        {
          region,
          platform_identifier: platformIdentifier,
        },
        { availability: 1 }
      );

      await DeploymentQuotaDomain.reservePlace(platformIdentifier, region);

      const updatedRequestQuota = await TestHelper.deploymentRequestQuota.load({
        region,
        platform_identifier: platformIdentifier,
      });

      expect(updatedRequestQuota).toBeDefined();
      expect(updatedRequestQuota!.availability).toBe(0);
    });
  });

  describe('freePlace', () => {
    it('should throw when quota is not found', async () => {
      const call = DeploymentQuotaDomain.freePlace(
        'test' as PlatformIdentifier,
        DeploymentRequestPlatformRegion.EuWest
      );

      await expect(call).rejects.toThrow(
        ErrorCode.DeploymentRequestQuotaNotFound
      );
    });

    it('should free a place', async () => {
      await TestHelper.deploymentRequestQuota.update(
        {
          region,
          platform_identifier: platformIdentifier,
        },
        { availability: 0 }
      );

      await DeploymentQuotaDomain.freePlace(platformIdentifier, region);

      const updatedRequestQuota = await TestHelper.deploymentRequestQuota.load({
        region,
        platform_identifier: platformIdentifier,
      });

      expect(updatedRequestQuota).toBeDefined();
      expect(updatedRequestQuota!.availability).toBe(1);
    });
  });

  describe('updateQuotaCapacity', () => {
    it('should throw when quota is not found', async () => {
      const call = DeploymentQuotaDomain.updateQuotaCapacity({
        platformIdentifier: 'test' as PlatformIdentifier,
        region,
        newCapacity: 1,
      });

      await expect(call).rejects.toThrow(
        ErrorCode.DeploymentRequestQuotaNotFound
      );
    });

    it.each`
      oldCapacity | oldAvailability | newCapacity | expectedAvailability
      ${5}        | ${2}            | ${2}        | ${-1}
      ${5}        | ${2}            | ${10}       | ${7}
    `(
      'should update capacity by $newCapacity and return $expectedAvailability availability',
      async ({
        oldCapacity,
        oldAvailability,
        newCapacity,
        expectedAvailability,
      }) => {
        await TestHelper.deploymentRequestQuota.update(
          {
            region,
            platform_identifier: platformIdentifier,
          },
          { capacity: oldCapacity, availability: oldAvailability }
        );

        const result = await DeploymentQuotaDomain.updateQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: newCapacity,
        });

        const updatedRequestQuota =
          await TestHelper.deploymentRequestQuota.load({
            region,
            platform_identifier: platformIdentifier,
          });

        expect(updatedRequestQuota).toMatchObject({
          capacity: newCapacity,
          availability: expectedAvailability,
        });
        expect(result.newAvailability).toBe(expectedAvailability);
      }
    );
  });
});
