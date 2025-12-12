import { describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import {
  DeploymentRequestPlatformRegion,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import DeploymentRequestQuota from '../../../model/kanel/public/DeploymentRequestQuota';
import { ErrorCode } from '../../../utils/error/error.code';
import { DeploymentsQuotasDomain } from './deployments.quotas.domain';

describe('DeploymentsQuotasDomain', () => {
  const platformIdentifier = PlatformIdentifier.Opencti;
  const region = DeploymentRequestPlatformRegion.UsEast;

  describe('reservePlace', () => {
    it('should throw when quota is not found', async () => {
      const call = DeploymentsQuotasDomain.reservePlace(
        'test' as PlatformIdentifier,
        DeploymentRequestPlatformRegion.EuWest
      );

      await expect(call).rejects.toThrow(
        ErrorCode.DeploymentRequestQuotaNotFound
      );
    });

    it('should return that place is not available when availability is equal to 0', async () => {
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({ availability: 0 })
        .where({ region, platform_identifier: platformIdentifier });

      const result = await DeploymentsQuotasDomain.reservePlace(
        platformIdentifier,
        region
      );

      expect(result.isPlaceAvailable).toBe(false);
    });

    it('should return that place is not available when availability is lower than 0', async () => {
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({ availability: -1 })
        .where({ region, platform_identifier: platformIdentifier });

      const result = await DeploymentsQuotasDomain.reservePlace(
        platformIdentifier,
        region
      );

      expect(result.isPlaceAvailable).toBe(false);
    });
    it('should return that place is available when availability is greater than 0', async () => {
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({ availability: 1 })
        .where({ region, platform_identifier: platformIdentifier });

      const result = await DeploymentsQuotasDomain.reservePlace(
        platformIdentifier,
        region
      );

      expect(result.isPlaceAvailable).toBe(true);
    });
    it('should reserve a place when availability is greater than 0', async () => {
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({ availability: 1 })
        .where({ region, platform_identifier: platformIdentifier });

      await DeploymentsQuotasDomain.reservePlace(platformIdentifier, region);

      const updatedRequestQuota = await db<DeploymentRequestQuota>(
        'DeploymentRequestQuota'
      )
        .select('*')
        .where({ region, platform_identifier: platformIdentifier })
        .first();

      expect(updatedRequestQuota).toBeDefined();
      expect(updatedRequestQuota!.availability).toBe(0);
    });
  });

  describe('freePlace', () => {
    it('should throw when quota is not found', async () => {
      const call = DeploymentsQuotasDomain.freePlace(
        'test' as PlatformIdentifier,
        DeploymentRequestPlatformRegion.EuWest
      );

      await expect(call).rejects.toThrow(
        ErrorCode.DeploymentRequestQuotaNotFound
      );
    });

    it('should free a place', async () => {
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({ availability: 0 })
        .where({ region, platform_identifier: platformIdentifier });

      await DeploymentsQuotasDomain.freePlace(platformIdentifier, region);

      const updatedRequestQuota = await db<DeploymentRequestQuota>(
        'DeploymentRequestQuota'
      )
        .select('*')
        .where({ region, platform_identifier: platformIdentifier })
        .first();

      expect(updatedRequestQuota).toBeDefined();
      expect(updatedRequestQuota!.availability).toBe(1);
    });
  });

  describe('updateQuotaCapacity', () => {
    it('should throw when quota is not found', async () => {
      const call = DeploymentsQuotasDomain.updateQuotaCapacity({
        platformIdentifier: 'test' as PlatformIdentifier,
        region,
        newCapacity: 1,
      });

      await expect(call).rejects.toThrow(
        ErrorCode.DeploymentRequestQuotaNotFound
      );
    });

    it('should decrement availability by capacity difference', async () => {
      const oldCapacity = 5;
      const oldAvailability = 2;
      const newCapacity = 2;
      const expectedAvailability = -1;
      const expectedDifference = -3;
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({ capacity: oldCapacity, availability: oldAvailability })
        .where({ region, platform_identifier: platformIdentifier });

      const result = await DeploymentsQuotasDomain.updateQuotaCapacity({
        platformIdentifier,
        region,
        newCapacity: newCapacity,
      });

      const updatedRequestQuota = await db<DeploymentRequestQuota>(
        'DeploymentRequestQuota'
      )
        .where({ region, platform_identifier: platformIdentifier })
        .select('*')
        .first();

      expect(updatedRequestQuota!.availability).toBe(expectedAvailability);
      expect(result.availabilityDifference).toBe(expectedDifference);
      expect(result.newAvailability).toBe(expectedAvailability);
    });

    describe('increment', () => {
      it('should increment availability by capacity difference', async () => {
        const oldCapacity = 5;
        const oldAvailability = 2;
        const newCapacity = 10;
        const expectedAvailability = 7;
        const expectedDifference = 5;

        await db<DeploymentRequestQuota>('DeploymentRequestQuota')
          .update({ capacity: oldCapacity, availability: oldAvailability })
          .where({ region, platform_identifier: platformIdentifier });

        const result = await DeploymentsQuotasDomain.updateQuotaCapacity({
          platformIdentifier,
          region,
          newCapacity: newCapacity,
        });

        const updatedRequestQuota = await db<DeploymentRequestQuota>(
          'DeploymentRequestQuota'
        )
          .where({ region, platform_identifier: platformIdentifier })
          .select('*')
          .first();

        expect(updatedRequestQuota!.availability).toBe(expectedAvailability);
        expect(result.availabilityDifference).toBe(expectedDifference);
        expect(result.newAvailability).toBe(expectedAvailability);
      });
    });
  });
});
