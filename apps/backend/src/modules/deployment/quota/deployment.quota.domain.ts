import { db } from '../../../../knexfile';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestPlatformRegion,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import DeploymentRequestQuota, {
  DeploymentRequestQuotaMutator,
} from '../../../model/kanel/public/DeploymentRequestQuota';
import { ErrorCode } from '../../../utils/error/error.code';

export type QuotaKey = {
  type: DeploymentRequestDeploymentType;
  platformIdentifier: PlatformIdentifier | null;
  region: DeploymentRequestPlatformRegion;
};

export const bundleQuotaKey = (
  region: DeploymentRequestPlatformRegion
): QuotaKey => ({
  type: DeploymentRequestDeploymentType.Bundle,
  platformIdentifier: null,
  region,
});

export const trialQuotaKey = (
  platformIdentifier: PlatformIdentifier | null,
  region: DeploymentRequestPlatformRegion
): QuotaKey => ({
  type: DeploymentRequestDeploymentType.Trial,
  platformIdentifier,
  region,
});

const isQuotaManagedPlatform = (
  platformIdentifier: PlatformIdentifier | null
): platformIdentifier is Exclude<
  PlatformIdentifier,
  PlatformIdentifier.Xtmone
> =>
  platformIdentifier !== null &&
  platformIdentifier !== PlatformIdentifier.Xtmone;

export const isQuotaManagedKey = (key: QuotaKey): boolean =>
  key.type === DeploymentRequestDeploymentType.Bundle ||
  isQuotaManagedPlatform(key.platformIdentifier);

const QUOTA_KEY_LOCK_ORDER = [
  DeploymentRequestDeploymentType.Bundle,
  DeploymentRequestDeploymentType.Trial,
];

const compareQuotaKeys = (a: QuotaKey, b: QuotaKey): number =>
  QUOTA_KEY_LOCK_ORDER.indexOf(a.type) - QUOTA_KEY_LOCK_ORDER.indexOf(b.type);

export const DeploymentQuotaDomain = {
  reservePlace: async (
    key: QuotaKey
  ): Promise<{ isPlaceAvailable: boolean }> => {
    if (!isQuotaManagedKey(key)) {
      return { isPlaceAvailable: true };
    }

    return DeploymentQuotaDomain.withLockedQuotaTransaction(
      [key],
      async ([quota]) => {
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
      }
    );
  },

  freePlace: async (key: QuotaKey): Promise<void> => {
    if (!isQuotaManagedKey(key)) {
      return;
    }

    await DeploymentQuotaDomain.withLockedQuotaTransaction(
      [key],
      async ([quota]) => {
        if (!quota) {
          throw new Error(ErrorCode.DeploymentRequestQuotaNotFound);
        }
        await db<DeploymentRequestQuota>('DeploymentRequestQuota')
          .update({ availability: quota.availability + 1 })
          .where({ id: quota.id });
      }
    );
  },

  updateQuotaCapacity: async ({
    key,
    newCapacity,
  }: {
    key: QuotaKey;
    newCapacity: number;
  }): Promise<{ newAvailability: number }> => {
    if (!isQuotaManagedKey(key)) {
      throw new Error(ErrorCode.DeploymentRequestQuotaNotFound);
    }

    return DeploymentQuotaDomain.withLockedQuotaTransaction(
      [key],
      async ([quota]) => {
        if (!quota) {
          throw new Error(ErrorCode.DeploymentRequestQuotaNotFound);
        }
        const difference = newCapacity - quota.capacity;
        const newAvailability = quota.availability + difference;
        await db<DeploymentRequestQuota>('DeploymentRequestQuota')
          .update({
            capacity: newCapacity,
            availability: newAvailability,
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
    keys: QuotaKey[],
    callback: (quotas: DeploymentRequestQuota[]) => Promise<T>
  ) => {
    const managedKeys = keys.filter(isQuotaManagedKey);
    if (managedKeys.length === 0) {
      return withTransaction(() => callback([]));
    }

    const orderedKeys = [...managedKeys].sort(compareQuotaKeys);

    return withTransaction(async () => {
      const quotas: DeploymentRequestQuota[] = [];
      for (const key of orderedKeys) {
        quotas.push(await lockQuota(key));
      }

      return callback(quotas);
    });
  },
};

const lockQuota = async (key: QuotaKey): Promise<DeploymentRequestQuota> => {
  const quota = await db<DeploymentRequestQuota>('DeploymentRequestQuota')
    .where({ region: key.region, type: key.type })
    .modify((builder) => {
      if (key.platformIdentifier === null) {
        builder.whereNull('platform_identifier');
      } else {
        builder.where({ platform_identifier: key.platformIdentifier });
      }
    })
    .select('*')
    .forUpdate()
    .first();
  if (!quota) {
    throw new Error(ErrorCode.DeploymentRequestQuotaNotFound);
  }

  return quota;
};
