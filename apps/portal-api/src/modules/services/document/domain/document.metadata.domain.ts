import { db } from '../../../../../knexfile';
import {
  Document as DocumentResolverType,
  IntegrationFeedType,
} from '../../../../__generated__/resolvers-types';
import {
  DocumentId,
  default as DocumentModel,
} from '../../../../model/kanel/public/Document';
import DocumentMetadata, {
  DocumentMetadataKey,
} from '../../../../model/kanel/public/DocumentMetadata';
import { DocumentData } from './document.domain';

export type DocumentMetadataKeys<T extends DocumentModel> = Array<
  Exclude<keyof Omit<T, 'labels'>, keyof DocumentResolverType>
>;

export const DocumentMetadataDomain = {
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
      value: data[key] as string,
    }));

    return db<DocumentMetadata>('Document_Metadata')
      .insert(metadataToInsert)
      .returning('*');
  },

  loadProductVersion: async (id: DocumentId): Promise<string | null> => {
    const metadata: DocumentMetadata = await db<DocumentMetadata>(
      'Document_Metadata'
    )
      .where('document_id', id)
      .where('key', 'product_version')
      .select('value')
      .first();

    return metadata?.value ?? null;
  },

  loadIntegrationType: async (
    document_id: string
  ): Promise<IntegrationFeedType | null> => {
    const doc = await db('Document_Metadata')
      .select('value')
      .where({
        key: 'integration_type',
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
};
