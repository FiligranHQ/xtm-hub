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

  insertMetadata: async <T extends DocumentModel>(
    id: DocumentId,
    data: DocumentData<T>,
    metadataKeys: DocumentMetadataKeys<T>
  ): Promise<DocumentMetadata[]> => {
    if (metadataKeys.length === 0) {
      return [];
    }

    const metadataToInsert = metadataKeys.map((key) => ({
      document_id: id,
      key: key as DocumentMetadataKey,
      value: data[key as keyof DocumentData<T>] as string,
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

  loadIntegrationType: async (
    document_id: string
  ): Promise<IntegrationType | null> => {
    const doc = await db('Document_Metadata')
      .select('value')
      .where({
        key: DocumentMetadataKeyCode.IntegrationType,
        document_id,
      })
      .first();

    return doc?.value ?? null;
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
    include_metadata.forEach((metaKey, index) => {
      const metaAlias = `meta${index}`;

      if (BOOLEAN_METADATA.includes(metaKey)) {
        qb.select(
          dbRaw(`
          CASE 
            WHEN "${metaAlias}"."value" = 'true' THEN true 
            WHEN "${metaAlias}"."value" = 'false' THEN false 
            ELSE "${metaAlias}"."value"::boolean 
          END as ${metaKey}
        `)
        );
      } else {
        qb.select(`${metaAlias}.value as ${metaKey}`);
      }

      qb.leftJoin({ [metaAlias]: 'Document_Metadata' }, function () {
        this.on(`${metaAlias}.document_id`, '=', 'Document.id').andOnVal(
          `${metaAlias}.key`,
          '=',
          metaKey
        );
      }).groupBy([metaKey]);
    });
  },
};
