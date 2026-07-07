import { db } from '../../../../knexfile';
import type { DocumentId } from '../../../model/kanel/public/Document';
import type Manifest from '../../../model/kanel/public/Manifest';
import type {
  ManifestId,
  ManifestInitializer,
} from '../../../model/kanel/public/Manifest';
import type ManifestDocument from '../../../model/kanel/public/ManifestDocument';
import type { ManifestDocumentInitializer } from '../../../model/kanel/public/ManifestDocument';
import type ManifestRebuildQueue from '../../../model/kanel/public/ManifestRebuildQueue';
import type { ManifestRebuildQueueInitializer } from '../../../model/kanel/public/ManifestRebuildQueue';
import { UnknownErrorCode } from '../../../utils/error/error.code';
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

  insertManifest: async (
    initializer: ManifestInitializer
  ): Promise<Manifest> => {
    const [manifest] = await db<Manifest>('Manifest')
      .insert(initializer)
      .returning('*');
    if (!manifest) {
      throw new Error(UnknownErrorCode.UnknownError);
    }
    return manifest;
  },

  insertManifestDocumentLinks: async (
    manifestId: ManifestId,
    documentIds: DocumentId[]
  ): Promise<void> => {
    if (documentIds.length === 0) return;
    const rows: ManifestDocumentInitializer[] = documentIds.map(
      (document_id) => ({
        manifest_id: manifestId,
        document_id,
      })
    );
    await db<ManifestDocument>('Manifest_Document').insert(rows);
  },

  deleteFromRebuildQueue: async ({
    platformIdentifier,
    version,
    type,
  }: ManifestKey): Promise<number> => {
    // .returning('id') is required here: a bare .delete() result is a plain
    // number, which postProcessResponse silently turns into undefined.
    const deletedRows = await db<ManifestRebuildQueue>('ManifestRebuildQueue')
      .where({
        product: platformIdentifier,
        version,
        type,
        status: ManifestRebuildQueueStatus.Processing,
      })
      .delete()
      .returning('id');
    return deletedRows.length;
  },

  recoverStuckProcessingEntries: async (): Promise<ManifestRebuildQueue[]> => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return db<ManifestRebuildQueue>('ManifestRebuildQueue')
      .where({ status: ManifestRebuildQueueStatus.Processing })
      .where('created_at', '<', thirtyMinutesAgo)
      .update({ status: ManifestRebuildQueueStatus.Pending })
      .returning('*');
  },
};
