import { db } from '../../../knexfile';
import OneClickDeployment, {
  OneClickDeploymentInitializer,
} from '../../model/kanel/public/OneClickDeployment';

interface LoadOneClickDeploymentsOptions {
  filter: Partial<OneClickDeployment>;
  orderBy?: {
    column: keyof OneClickDeployment & string;
    order: 'asc' | 'desc';
  };
  limit?: number;
}

export const OneClickDeploymentDomain = {
  insert: async (init: OneClickDeploymentInitializer): Promise<void> => {
    await db<OneClickDeployment>('OneClickDeployment').insert(init);
  },

  loadOneClickDeployments: async ({
    filter,
    orderBy = { column: 'deployed_at', order: 'desc' },
    limit,
  }: LoadOneClickDeploymentsOptions): Promise<OneClickDeployment[]> => {
    return db<OneClickDeployment>('OneClickDeployment')
      .where(filter)
      .orderBy(orderBy.column, orderBy.order)
      .modify((query) => {
        if (limit !== undefined) {
          query.limit(limit);
        }
      });
  },

  loadDeployedPlatformKeys: async (): Promise<
    Pick<OneClickDeployment, 'platform_id' | 'tenant_id'>[]
  > => {
    return db<OneClickDeployment>('OneClickDeployment').distinct(
      'platform_id',
      'tenant_id'
    );
  },
};
