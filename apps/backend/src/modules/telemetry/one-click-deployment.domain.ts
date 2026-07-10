import { db } from '../../../knexfile';
import OneClickDeployment, {
  OneClickDeploymentInitializer,
} from '../../model/kanel/public/OneClickDeployment';

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
    limit: number,
    platformId: string
  ): Promise<LastDeployedRow[]> => {
    return db<OneClickDeployment>('OneClickDeployment')
      .where('platform_id', platformId)
      .orderBy('deployed_at', 'desc')
      .limit(limit)
      .select('resource_id', 'user_id', 'deployed_at as deployedAt');
  },
};
