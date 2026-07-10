import { db } from '../../../knexfile';
import { PlatformIdentifier } from '../../__generated__/resolvers-types';
import OneClickDeployment, {
  OneClickDeploymentInitializer,
} from '../../model/kanel/public/OneClickDeployment';
import { TelemetryTargetProductMappedByPlatformIdentifier } from './telemetry.helper';

export interface LastDeployedRow {
  resource_id: string;
  user_id: string | null;
  deployedAt: Date;
}

export const OneClickDeploymentDomain = {
  insert: async (init: OneClickDeploymentInitializer): Promise<void> => {
    await db<OneClickDeployment>('OneClickDeployment').insert(init);
  },

  loadLastDeployed: async (
    organizationId: string,
    limit: number,
    platformIdentifiers?: PlatformIdentifier[]
  ): Promise<LastDeployedRow[]> => {
    return db<OneClickDeployment>('OneClickDeployment')
      .where('organization_id', organizationId)
      .modify((query) => {
        if (platformIdentifiers && platformIdentifiers.length > 0) {
          const targetProducts = platformIdentifiers.flatMap((identifier) => {
            const product =
              TelemetryTargetProductMappedByPlatformIdentifier.get(identifier);
            return product ? [product] : [];
          });
          query.whereIn('target_product', targetProducts);
        }
      })
      .orderBy('deployed_at', 'desc')
      .limit(limit)
      .select('resource_id', 'user_id', 'deployed_at as deployedAt');
  },
};
