import { db } from '../../../../knexfile';
import { ManifestType } from '../../../__generated__/resolvers-types';
import type ManifestRebuildQueue from '../../../model/kanel/public/ManifestRebuildQueue';
import type { ManifestRebuildQueueInitializer } from '../../../model/kanel/public/ManifestRebuildQueue';
import { ManifestRebuildQueueStatus } from './manifest.consts';

export const ManifestDomain = {
  insertIfNotPending: async (
    product: string,
    version: string,
    type: ManifestType
  ): Promise<void> => {
    const row: ManifestRebuildQueueInitializer = {
      product,
      version,
      type,
      status: ManifestRebuildQueueStatus.Pending,
    };
    await db<ManifestRebuildQueue>('ManifestRebuildQueue')
      .insert(row)
      .onConflict(['product', 'version', 'type', 'status'])
      .ignore();
  },
};
