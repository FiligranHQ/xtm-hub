import { describe, expect, it, vi } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestPlatformRegion,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import { ErrorCode } from '../../../utils/error/error.code';
import {
  bundleQuotaKey,
  DeploymentQuotaDomain,
  trialQuotaKey,
} from './deployment.quota.domain';

describe('deploymentQuotaDomain', () => {
  const platformIdentifier = PlatformIdentifier.Opencti;
  const region = DeploymentRequestPlatformRegion.UsEast;
  const productKey = trialQuotaKey(platformIdentifier, region);
  const bundleKey = bundleQuotaKey(region);
  const bundleQuotaFilter = {
    region,
    type: DeploymentRequestDeploymentType.Bundle,
  };

  describe('reservePlace', () => {
    it('should throw when quota is not found', async () => {
      const call = DeploymentQuotaDomain.reservePlace(
        trialQuotaKey(
          'test' as PlatformIdentifier,
          DeploymentRequestPlatformRegion.EuWest
        )
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

      const result = await DeploymentQuotaDomain.reservePlace(productKey);

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

      const result = await DeploymentQuotaDomain.reservePlace(productKey);

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

      const result = await DeploymentQuotaDomain.reservePlace(productKey);

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

      await DeploymentQuotaDomain.reservePlace(productKey);

      const updatedRequestQuota = await TestHelper.deploymentRequestQuota.load({
        region,
        platform_identifier: platformIdentifier,
      });

      expect(updatedRequestQuota).toBeDefined();
      expect(updatedRequestQuota!.availability).toBe(0);
    });

    it('should return that place is available without a quota row for xtmone', async () => {
      const result = await DeploymentQuotaDomain.reservePlace(
        trialQuotaKey(PlatformIdentifier.Xtmone, region)
      );

      expect(result.isPlaceAvailable).toBe(true);
    });

    it('should reserve a place on the bundle quota', async () => {
      await TestHelper.deploymentRequestQuota.update(bundleQuotaFilter, {
        availability: 3,
      });

      const result = await DeploymentQuotaDomain.reservePlace(bundleKey);

      const updatedRequestQuota =
        await TestHelper.deploymentRequestQuota.load(bundleQuotaFilter);

      expect(result.isPlaceAvailable).toBe(true);
      expect(updatedRequestQuota!.availability).toBe(2);
    });

    it('should refuse a blocking reservation when the bundle quota is exhausted', async () => {
      await TestHelper.deploymentRequestQuota.update(bundleQuotaFilter, {
        availability: 0,
      });

      const result = await DeploymentQuotaDomain.reservePlace(bundleKey);

      const updatedRequestQuota =
        await TestHelper.deploymentRequestQuota.load(bundleQuotaFilter);

      expect(result.isPlaceAvailable).toBe(false);
      expect(updatedRequestQuota!.availability).toBe(0);
    });

    it('should let a non-blocking reservation drive the bundle quota negative', async () => {
      await TestHelper.deploymentRequestQuota.update(bundleQuotaFilter, {
        availability: 0,
      });

      const result = await DeploymentQuotaDomain.reservePlace(bundleKey, {
        blocking: false,
      });

      const updatedRequestQuota =
        await TestHelper.deploymentRequestQuota.load(bundleQuotaFilter);

      expect(result.isPlaceAvailable).toBe(true);
      expect(updatedRequestQuota!.availability).toBe(-1);
    });
  });

  describe('freePlace', () => {
    it('should throw when quota is not found', async () => {
      const call = DeploymentQuotaDomain.freePlace(
        trialQuotaKey(
          'test' as PlatformIdentifier,
          DeploymentRequestPlatformRegion.EuWest
        )
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

      await DeploymentQuotaDomain.freePlace(productKey);

      const updatedRequestQuota = await TestHelper.deploymentRequestQuota.load({
        region,
        platform_identifier: platformIdentifier,
      });

      expect(updatedRequestQuota).toBeDefined();
      expect(updatedRequestQuota!.availability).toBe(1);
    });

    it('should free a place on the bundle quota, from a negative availability', async () => {
      await TestHelper.deploymentRequestQuota.update(bundleQuotaFilter, {
        availability: -2,
      });

      await DeploymentQuotaDomain.freePlace(bundleKey);

      const updatedRequestQuota =
        await TestHelper.deploymentRequestQuota.load(bundleQuotaFilter);

      expect(updatedRequestQuota!.availability).toBe(-1);
    });

    it('should be a no-op without a quota row for xtmone', async () => {
      await expect(
        DeploymentQuotaDomain.freePlace(
          trialQuotaKey(PlatformIdentifier.Xtmone, region)
        )
      ).resolves.toBeUndefined();
    });
  });

  describe('updateQuotaCapacity', () => {
    it('should throw when quota is not found', async () => {
      const call = DeploymentQuotaDomain.updateQuotaCapacity({
        key: trialQuotaKey('test' as PlatformIdentifier, region),
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
      'should update capacity to $newCapacity and return $expectedAvailability availability',
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
          key: productKey,
          newCapacity,
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

    it('should keep a negative availability negative when raising the bundle capacity', async () => {
      await TestHelper.deploymentRequestQuota.update(bundleQuotaFilter, {
        capacity: 20,
        availability: -3,
      });

      const result = await DeploymentQuotaDomain.updateQuotaCapacity({
        key: bundleKey,
        newCapacity: 21,
      });

      const updatedRequestQuota =
        await TestHelper.deploymentRequestQuota.load(bundleQuotaFilter);

      expect(result.newAvailability).toBe(-2);
      expect(updatedRequestQuota).toMatchObject({
        capacity: 21,
        availability: -2,
      });
    });
  });

  describe('withLockedQuotaTransaction', () => {
    it('should call back with no quota and not throw for a non quota-managed key', async () => {
      const callback = vi.fn().mockResolvedValue('result');

      const result = await DeploymentQuotaDomain.withLockedQuotaTransaction(
        [trialQuotaKey(PlatformIdentifier.Xtmone, region)],
        callback
      );

      expect(callback).toHaveBeenCalledWith([]);
      expect(result).toBe('result');
    });

    it('should lock the bundle quota before the product quota', async () => {
      const callback = vi.fn().mockResolvedValue('result');

      await DeploymentQuotaDomain.withLockedQuotaTransaction(
        [productKey, bundleKey],
        callback
      );

      const [lockedQuotas] = callback.mock.calls[0];
      expect(lockedQuotas.map((quota) => quota.type)).toEqual([
        DeploymentRequestDeploymentType.Bundle,
        DeploymentRequestDeploymentType.Trial,
      ]);
    });
  });
});
