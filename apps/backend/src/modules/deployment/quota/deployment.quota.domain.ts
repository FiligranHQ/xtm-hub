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

export const DeploymentQuotaDomain = {
  reservePlace: async (
    platformIdentifier: PlatformIdentifier | null,
    region: DeploymentRequestPlatformRegion
  ): Promise<{ isPlaceAvailable: boolean }> => {
    return DeploymentQuotaDomain.withLockedQuotaTransaction(
      { platformIdentifier, region },
      async (quota) => {
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
      }
    );
  },

  freePlace: async (
    platformIdentifier: PlatformIdentifier | null,
    region: DeploymentRequestPlatformRegion
  ): Promise<void> => {
    await DeploymentQuotaDomain.withLockedQuotaTransaction(
      { platformIdentifier, region },
      async (quota) => {
        await db<DeploymentRequestQuota>('DeploymentRequestQuota')
          .update({ availability: quota.availability + 1 })
          .where({ id: quota.id });
      }
    );
  },

  updateQuotaCapacity: async ({
    platformIdentifier,
    region,
    newCapacity,
  }: {
    platformIdentifier: PlatformIdentifier;
    region: DeploymentRequestPlatformRegion;
    newCapacity: number;
  }): Promise<{ newAvailability: number }> => {
    return DeploymentQuotaDomain.withLockedQuotaTransaction(
      { platformIdentifier, region },
      async (quota) => {
        const difference = newCapacity - quota.capacity;
        const newAvailability = quota.availability + difference;
        await db<DeploymentRequestQuota>('DeploymentRequestQuota')
          .update({
            capacity: newCapacity,
            availability: quota.availability + difference,
          })
          .where({ id: quota.id });

        return { newAvailability };
      }
    );
  },

  loadQuotas: async (field: DeploymentRequestQuotaMutator) => {
    return db<DeploymentRequestQuota[]>('DeploymentRequestQuota')
      .where(field)
      .select('*');
  },

  withLockedQuotaTransaction: async <T>(
    {
      platformIdentifier,
      region,
    }: {
      platformIdentifier: PlatformIdentifier | null;
      region: DeploymentRequestPlatformRegion;
    },
    callback: (quota: DeploymentRequestQuota) => Promise<T>
  ) => {
    return withTransaction(async () => {
      const quota = await lockQuota(platformIdentifier, region);

      return callback(quota);
    });
  },
};

const lockQuota = async (
  platformIdentifier: PlatformIdentifier | null,
  region: DeploymentRequestPlatformRegion
): Promise<DeploymentRequestQuota> => {
  if (!platformIdentifier) {
    throw new Error(ErrorCode.DeploymentRequestQuotaNotFound);
  }

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

  return quota;
};
