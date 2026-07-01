import { db } from '../../../../knexfile';
import type ManifestRebuildQueue from '../../../model/kanel/public/ManifestRebuildQueue';
import type { ManifestRebuildQueueInitializer } from '../../../model/kanel/public/ManifestRebuildQueue';
import { ManifestKey, ManifestRebuildQueueStatus } from './manifest.consts';

export const ManifestDomain = {
  insertIfNotPending: async ({
    platformIdentifier,
    version,
    type,
  }: ManifestKey): Promise<void> => {
    const row: ManifestRebuildQueueInitializer = {
      product: platformIdentifier,
      version,
      type,
      status: ManifestRebuildQueueStatus.Pending,
    };
    await db<ManifestRebuildQueue>('ManifestRebuildQueue')
      .insert(row)
      .onConflict(['product', 'version', 'type', 'status'])
      .ignore();
  },

  loadPendingManifestsForProcessing: async (
    filter?: ManifestKey
  ): Promise<ManifestRebuildQueue[]> => {
    // transaction is not mandatory since done in a single query, but forUpdate and skipLocked are still needed in the subquery
    const subquery = db<ManifestRebuildQueue>('ManifestRebuildQueue')
      .select('id')
      .where({
        status: ManifestRebuildQueueStatus.Pending,
        ...(filter
          ? {
              product: filter.platformIdentifier,
              version: filter.version,
              type: filter.type,
            }
          : {}),
      })
      .forUpdate()
      .skipLocked();

    return db<ManifestRebuildQueue>('ManifestRebuildQueue')
      .whereIn('id', subquery)
      .update({ status: ManifestRebuildQueueStatus.Processing })
      .returning('*');
  },
};
