import { Knex } from 'knex';
import { db, dbRaw } from '../../../../knexfile';
import {
  DocumentMetadataKeyCode,
  DocumentMetadata as DocumentMetadataResolverType,
  Document as DocumentResolverType,
  IntegrationType,
} from '../../../__generated__/resolvers-types';
import {
  DocumentId,
  default as DocumentModel,
} from '../../../model/kanel/public/Document';
import DocumentMetadata, {
  DocumentMetadataKey,
} from '../../../model/kanel/public/DocumentMetadata';
import { BOOLEAN_METADATA } from '../document.helper';
import { DocumentData } from './document.domain';

export type DocumentMetadataKeys<T extends DocumentModel> = Array<
  Exclude<
    keyof Omit<
      DocumentData<T>,
      | 'use_cases'
      | 'uploader_id'
      | 'uploader_organization_id'
      | 'remover_id'
      | 'mime_type'
      | 'source_type'
      | 'parent_document_id'
      | 'minio_name'
      | 'tags'
      | 'is_decommissioned'
      | 'version'
    >,
    keyof DocumentResolverType
  >
>;

export const DocumentMetadataDomain = {
  insertMetadataFromKeyValue: async (
    id: DocumentId,
    metadataInput: DocumentMetadataResolverType[]
  ): Promise<DocumentMetadata[]> => {
    if (!metadataInput.length) {
      return [];
    }

    const metadataToInsert: DocumentMetadata[] = metadataInput.map((meta) => ({
      document_id: id,
      key: meta.key as DocumentMetadataKey,
      value: meta.value,
    }));

    return db<DocumentMetadata>('Document_Metadata')
      .insert(metadataToInsert)
      .returning('*');
  },

  insertMetadata: async <T extends DocumentModel, TUseCase extends string>(
    id: DocumentId,
    data: DocumentData<T, TUseCase>,
    metadataKeys: DocumentMetadataKeys<T>
  ): Promise<DocumentMetadata[]> => {
    if (metadataKeys.length === 0) {
      return [];
    }

    const metadataToInsert = metadataKeys.map((key) => ({
      document_id: id,
      key: key as DocumentMetadataKey,
      value: data[key as keyof DocumentData<T, TUseCase>] as string,
    }));

    return db<DocumentMetadata>('Document_Metadata')
      .insert(metadataToInsert)
      .returning('*');
  },

  loadMetadataValueByKey: async (
    id: DocumentId,
    key: string
  ): Promise<string | null> => {
    const metadata: DocumentMetadata = await db<DocumentMetadata>(
      'Document_Metadata'
    )
      .where('document_id', id)
      .where('key', key)
      .select('value')
      .first();

    return metadata?.value ?? null;
  },

  loadProductVersion: async (id: DocumentId): Promise<string | null> => {
    const metadata: DocumentMetadata = await db<DocumentMetadata>(
      'Document_Metadata'
    )
      .where('document_id', id)
      .where('key', DocumentMetadataKeyCode.ProductVersion)
      .select('value')
      .first();

    return metadata?.value ?? null;
  },

  buildIntegrationTypeQuery: (documentIds: readonly string[]) => {
    return db<{ document_id: string; value: IntegrationType }>(
      'Document_Metadata'
    )
      .select('document_id', 'value')
      .whereIn('document_id', documentIds)
      .where('key', DocumentMetadataKeyCode.IntegrationType);
  },

  loadIntegrationType: async (
    document_id: string
  ): Promise<IntegrationType | null> => {
    const rows = await DocumentMetadataDomain.buildIntegrationTypeQuery([
      document_id,
    ]);
    return rows[0]?.value ?? null;
  },

  deleteMetadata: async ({
    id,
    excludedKeys = [],
  }: {
    id: DocumentId;
    excludedKeys?: string[];
  }) => {
    const qb = db<DocumentMetadata>('Document_Metadata').where(
      'document_id',
      id
    );

    excludedKeys.forEach((key) => {
      qb.whereNot('key', key);
    });

    await qb.delete();
  },

  addIncludeMetadataQuery: (
    qb: Knex.QueryBuilder,
    include_metadata: DocumentMetadataKeyCode[] = []
  ) => {
    if (!include_metadata.length) return;

    // Single JOIN filtered to the keys we need — avoids N separate LEFT JOINs.
    // Using andOnIn so the filter is part of the JOIN condition (not WHERE),
    // preserving LEFT JOIN semantics for documents with no metadata rows.
    qb.leftJoin({ dm_pivot: 'Document_Metadata' }, function () {
      this.on('dm_pivot.document_id', '=', 'Document.id').andOnIn(
        'dm_pivot.key',
        include_metadata
      );
    });

    // Pivot each key with conditional aggregation.
    // Because these are aggregate expressions, they do NOT need to appear in
    // GROUP BY — only the non-aggregated Document.id does (already added by
    // the caller via .groupBy(['Document.id'])).
    include_metadata.forEach((metaKey) => {
      if (BOOLEAN_METADATA.includes(metaKey)) {
        qb.select(
          dbRaw(
            `(MAX(CASE WHEN "dm_pivot"."key" = ? THEN "dm_pivot"."value" END) = 'true') as "${metaKey}"`,
            [metaKey]
          )
        );
      } else {
        qb.select(
          dbRaw(
            `MAX(CASE WHEN "dm_pivot"."key" = ? THEN "dm_pivot"."value" END) as "${metaKey}"`,
            [metaKey]
          )
        );
      }
    });
  },
};
