import { v4 as uuidv4 } from 'uuid';
import { db } from '../../knexfile';
import {
  DeploymentRequest,
  DeploymentRequestDeploymentType,
  DeploymentRequestPlatformRegion,
  PlatformIdentifier,
} from '../../src/__generated__/resolvers-types';
import {
  DeploymentRequestId,
  DeploymentRequestMutator,
} from '../../src/model/kanel/public/DeploymentRequest';
import DeploymentRequestQuota, {
  DeploymentRequestQuotaMutator,
} from '../../src/model/kanel/public/DeploymentRequestQuota';

export const TestDeploymentHelper = {
  deploymentRequest: {
    delete: async (field: DeploymentRequestMutator) => {
      await db<DeploymentRequest>('DeploymentRequest').where(field).del();
    },
    update: async (field: DeploymentRequestMutator) => {
      await db<DeploymentRequest>('DeploymentRequest').update(field);
    },
    create: async (
      data?: DeploymentRequestMutator
    ): Promise<DeploymentRequest | undefined> => {
      const [deploymentRequest] = await db<DeploymentRequest>(
        'DeploymentRequest'
      )
        .insert({
          id: uuidv4() as DeploymentRequestId,
          platform_id: uuidv4(),
          type: DeploymentRequestDeploymentType.Trial,
          platform_identifier: PlatformIdentifier.Opencti,
          region: DeploymentRequestPlatformRegion.EuWest,
          ...data,
        })
        .returning('*');
      return deploymentRequest;
    },
  },
  deploymentRequestQuota: {
    load: async (
      field: DeploymentRequestQuotaMutator
    ): Promise<DeploymentRequestQuota | undefined> => {
      return db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .where(field)
        .select('*')
        .first();
    },
    update: async (
      fieldWhere: DeploymentRequestQuotaMutator,
      fieldUpdate: DeploymentRequestQuotaMutator
    ): Promise<void> => {
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update(fieldUpdate)
        .where(fieldWhere);
    },
  },
};
