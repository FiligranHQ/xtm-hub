import { db } from '../../../../knexfile';
import {
  DeploymentRequestPlatformRegion,
  PlatformIdentifier,
} from '../../../__generated__/resolvers-types';
import { withTransaction } from '../../../context/database.context';
import DeploymentRequestQuota from '../../../model/kanel/public/DeploymentRequestQuota';
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
};
