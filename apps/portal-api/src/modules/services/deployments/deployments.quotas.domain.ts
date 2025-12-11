import { db } from '../../../../knexfile';
import {
  DeploymentRequestPlatformRegion,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import DeploymentRequestQuota, {
  DeploymentRequestQuotaMutator,
} from '../../../model/kanel/public/DeploymentRequestQuota';
import { ErrorCode } from '../../../utils/error/error.code';

export const DeploymentsQuotasDomain = {
  reservePlace: async (
    platformIdentifier: PlatformIdentifier,
    region: DeploymentRequestPlatformRegion
  ): Promise<{ isPlaceAvailable: boolean }> => {
    return withTransaction(async () => {
      const quota = await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .where({
          region: region,
          platform_identifier: platformIdentifier,
        })
        .select('*')
        .forUpdate()
        .first();
      if (!quota) {
        throw new Error(ErrorCode.DeploymentRequestQuotaNotFound);
      }

      if (quota.availability <= 0) {
        return {
          isPlaceAvailable: false,
        };
      }

      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({ availability: quota.availability - 1 })
        .where({ id: quota.id });
      return {
        isPlaceAvailable: true,
      };
    });
  },

  freePlace: async (
    platformIdentifier: PlatformIdentifier,
    region: DeploymentRequestPlatformRegion
  ): Promise<void> => {
    await withTransaction(async () => {
      const quota = await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .where({
          region: region,
          platform_identifier: platformIdentifier,
        })
        .select('*')
        .forUpdate()
        .first();
      if (!quota) {
        throw new Error(ErrorCode.DeploymentRequestQuotaNotFound);
      }

      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({ availability: quota.availability + 1 })
        .where({ id: quota.id });
    });
  },

  updateQuotaCapacity: async ({
    platformIdentifier,
    region,
    newCapacity,
  }: {
    platformIdentifier: PlatformIdentifier;
    region: DeploymentRequestPlatformRegion;
    newCapacity: number;
  }): Promise<{ availabilityDifference: number; newAvailability: number }> => {
    return withTransaction(async () => {
      const quota = await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .where({
          region: region,
          platform_identifier: platformIdentifier,
        })
        .select('*')
        .forUpdate()
        .first();

      if (!quota) {
        throw new Error(ErrorCode.DeploymentRequestQuotaNotFound);
      }

      const difference = newCapacity - quota.capacity;
      const newAvailability = quota.availability + difference;
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update({
          capacity: newCapacity,
          availability: quota.availability + difference,
        })
        .where({ id: quota.id });

      return {
        availabilityDifference: difference,
        newAvailability,
      };
    });
  },

  loadQuotas: async (field: DeploymentRequestQuotaMutator) => {
    return db<DeploymentRequestQuota[]>('DeploymentRequestQuota')
      .where(field)
      .select('*');
  },
};
